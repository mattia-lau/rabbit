import {
  Adapater,
  compress,
  type IAdapterOptions,
  type IContext,
} from "@rabbit/common";
import { createServer, IncomingMessage } from "http";
import { Writable } from "node:stream";
import "reflect-metadata";

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

const createRequest = async (req: IncomingMessage, host: string) => {
  // @ts-ignore
  return new Request(host, { ...req, body: req });
};

export class NodeAdapter extends Adapater {
  createServer(options: IAdapterOptions): void {
    const { application, hostname, ...rest } = options;

    createServer(async (req, res) => {
      let pathname = req.url!;
      if (pathname.charAt(pathname.length - 1) !== "/") {
        pathname = `${pathname}/`;
      }

      const event = `${req.method!.toUpperCase()}__${pathname}`;

      const host = req.headers.host ?? hostname;

      const request = await createRequest(req, host!);

      const ctx: IContext = {
        ...rest,
        req: request,
        event,
        res: {
          body: "",
          status: 200,
          headers: new Headers(),
        },
      };

      const result = await application.emitAsync(event, ctx).catch((err) => {
        ctx.res.body = err.message;
        ctx.res.status = err.statusCode;

        return [err.message];
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
    }).listen(3000);
  }
}
