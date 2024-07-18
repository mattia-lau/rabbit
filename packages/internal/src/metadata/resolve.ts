import "reflect-metadata";

import { type Constructor, type IContext } from "@rabbit/common";
import {
  CONTEXT_METADATA,
  CUSTOM_METADATA,
  HEADERS_METADATA,
  HEADER_METADATA,
  PARAMS_METADATA,
} from "./symbols";

export const resolveParams = async (
  listener: any,
  pathMatch: any,
  ctx: IContext,
  ref?: Constructor
) => {
  const data = new Array(listener.length);

  {
    const resHeaders = Reflect.getMetadata(HEADER_METADATA, listener) ?? [];
    Object.entries(resHeaders).forEach(([key, val]) => {
      ctx.res.headers.set(key, val as string);
    });
  }

  {
    const customDecorators =
      Reflect.getMetadata(CUSTOM_METADATA, listener) ?? [];
    for (const decorator of customDecorators) {
      data[decorator.index] = decorator.factory(ctx);
    }
  }

  let fn = listener;
  if (ref) {
    fn = listener.bind(ref);
  }

  const body = await fn(...data);

  return body;
};
