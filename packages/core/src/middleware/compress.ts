import { IContext } from "@rabbit/common";
import "../polyfills/compress-stream";

const ENCODING_TYPES = ["gzip", "deflate"] as const;

declare var CompressionStream;

interface CompressionOptions {
  encodings?: (typeof ENCODING_TYPES)[number];
  ctx: IContext;
}

export const compress = ({ encodings, ctx }: CompressionOptions): Response => {
  const { req, res } = ctx;

  const accepted = req.headers.get("Accept-Encoding");
  const encoding =
    encodings ??
    ENCODING_TYPES.find((encoding) => accepted?.includes(encoding));

  if (!encoding) {
    return new Response(res.body, {
      ...res,
    });
  }

  const isJSON = typeof res.body === "object";
  const readableStream = new Response(
    isJSON ? JSON.stringify(res.body) : res.body
  );
  const stream = new CompressionStream(encoding);
  const response = new Response(readableStream.body?.pipeThrough(stream), res);
  response.headers.set("Content-Encoding", encoding);

  if (isJSON) {
    response.headers.set("Content-Type", "application/json");
  }

  return response;
};
