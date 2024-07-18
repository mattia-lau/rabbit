import {
  Adapter,
  compress,
  createContext,
  type IAdapterOptions,
} from "@rabbit/common";
import { createServer, IncomingMessage } from "http";
import { Writable } from "node:stream";

const writeFromReadableStream = (
  stream: ReadableStream<Uint8Array>,
  writable: Writable
) => {
  if (stream.locked) {
    throw new TypeError("ReadableStream is locked.");
  } else if (writable.destroyed) {
    stream.cancel();
    return;
  }
  const reader = stream.getReader();
  writable.on("close", cancel);
  writable.on("error", cancel);
  reader.read().then(flow, cancel);
  return reader.closed.finally(() => {
    writable.off("close", cancel);
    writable.off("error", cancel);
  });

  function cancel(error?: any) {
    reader.cancel(error).catch(() => {});
    if (error) {
      writable.destroy(error);
    }
  }
  function onDrain() {
    reader.read().then(flow, cancel);
  }
  function flow({
    done,
    value,
  }: // @ts-ignore
  ReadableStreamReadResult<Uint8Array>): void | Promise<void> {
    try {
      if (done) {
        writable.end();
      } else if (!writable.write(value)) {
        writable.once("drain", onDrain);
      } else {
        return reader.read().then(flow, cancel);
      }
    } catch (e) {
      cancel(e);
    }
  }
};

const createRequest = async (r: IncomingMessage, host: string) => {
  const ctrl = new AbortController();
  const headers = new Headers(r.headers as Record<string, string>);
  const url = `https://${host}${r.url}`;

  r.once("aborted", () => ctrl.abort());

  const method = (r.method ?? "GET").toUpperCase();

  const init = {
    headers,
    method: r.method,
    signal: ctrl.signal,
    duplex: "half",
  };

  if (method !== "GET" && method !== "HEAD") {
    Object.assign(init, { body: r });
  }

  return new Request(url, init);
};

export class NodeAdapter extends Adapter {
  createServer(options: IAdapterOptions): void {
    const { application, hostname, port, ...rest } = options;

    createServer(async (req, res) => {
      const host = req.headers.host ?? hostname;
      const request = await createRequest(req, host!);

      const ctx = await createContext(options, request);

      const result = await application
        .emitAsync(ctx.event, ctx)
        .catch((err) => {
          ctx.res.body = err.message;
          ctx.res.status = err.statusCode;

          return err.message;
        });

      if (typeof res === "object") {
        ctx.res.headers.set("Content-Type", "application/json");
      }
      ctx.res.body = result;

      const stream = compress({ ctx });

      stream.headers.forEach((val, key) => {
        res.setHeader(key, val);
      });
      res.statusCode = ctx.res.status;

      writeFromReadableStream(stream.body!, res);
    }).listen(port);
  }
}
