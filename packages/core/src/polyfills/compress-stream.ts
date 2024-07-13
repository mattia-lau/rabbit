import {
  createDeflate,
  createDeflateRaw,
  createGunzip,
  createGzip,
  createInflate,
  createInflateRaw,
} from "zlib";

declare module globalThis {
  var CompressionStream: any;
  var DecompressionStream: any;
}

const make = (ctx: Object, handle: any) =>
  Object.assign(ctx, {
    writable: new WritableStream({
      write: (chunk) => handle.write(chunk),
      close: () => handle.end(),
    }),
    readable: new ReadableStream({
      // @ts-ignore
      type: "bytes",
      start(ctrl) {
        handle.on("data", (chunk: any) => ctrl.enqueue(chunk));
        handle.once("end", () => ctrl.close());
      },
    }),
  });

globalThis.CompressionStream ??= class CompressionStream {
  constructor(format: "deflate" | "gzip" | "deflate-raw") {
    make(
      this,
      format === "deflate"
        ? createDeflate()
        : format === "gzip"
        ? createGzip()
        : createDeflateRaw()
    );
  }
};

globalThis.DecompressionStream ??= class DecompressionStream {
  constructor(format: "deflate" | "gzip" | "deflate-raw") {
    make(
      this,
      format === "deflate"
        ? createInflate()
        : format === "gzip"
        ? createGunzip()
        : createInflateRaw()
    );
  }
};
