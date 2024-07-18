import { RABBIT_GLOBA_INTERCEPTOR } from "@rabbit/internal";
import merge from "lodash.merge";
import type { IAdapterOptions } from "../adapter/base.adapter.ts";
import { bodyParser } from "../body-parser.ts";
import type { IContext } from "../interfaces/context.interface.ts";

export const createContext = async (
  options: IAdapterOptions,
  request: Request
) => {
  let { pathname, search } = new URL(request.url);
  if (pathname.charAt(pathname.length - 1) !== "/") {
    pathname = `${pathname}/`;
  }

  const event = `${request.method.toUpperCase()}__${pathname}`;
  const { application, port, interceptors, makeContext, ...rest } = options;

  const ctx: IContext = {
    ...rest,
    application,
    [RABBIT_GLOBA_INTERCEPTOR]: interceptors,
    req: {
      ...request,
      body: await bodyParser(request),
      headers: request.headers,
      search,
      method: request.method.toUpperCase(),
    },
    event,
    res: {
      body: "",
      status: 200,
      headers: new Headers(),
    },
  };

  if (makeContext) {
    merge(ctx, await makeContext(ctx));
  }

  return ctx;
};
