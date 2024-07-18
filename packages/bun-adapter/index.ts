import {
  Adapter,
  bodyParser,
  compress,
  type IAdapterOptions,
  type IContext,
} from "@rabbit/common";
import { RABBIT_GLOBA_INTERCEPTOR } from "@rabbit/internal";
import "reflect-metadata";

export class BunAdapter extends Adapter {
  createServer(options: IAdapterOptions): void {
    const { application, port, ...rest } = options;

    Bun.serve({
      port,
      fetch: async (request) => {
        let { pathname } = new URL(request.url);
        if (pathname.charAt(pathname.length - 1) !== "/") {
          pathname = `${pathname}/`;
        }

        const event = `${request.method.toUpperCase()}__${pathname}`;

        const ctx: IContext = {
          ...rest,
          application,
          [RABBIT_GLOBA_INTERCEPTOR]: options.interceptors,
          req: {
            ...request,
            body: await bodyParser(request),
            headers: request.headers,
          },
          event,
          res: {
            body: "",
            status: 200,
            headers: new Headers(),
          },
        };

        if (options.makeContext) {
          Object.assign(ctx, await options.makeContext(ctx));
        }

        const res = await application.emitAsync(event, ctx).catch((err) => {
          return [
            new Response(err.message, {
              status: err.statusCode,
            }),
          ];
        });

        if (res instanceof Response) {
          return res;
        }

        ctx.res.body = res;
        const headers = new Headers({
          ...ctx.res.headers,
          ...(typeof res === "object" && {
            "Content-Type": "application/json",
          }),
        });

        if (options.compress) {
          return compress({
            ctx,
          });
        }

        return new Response(
          typeof res === "object" ? JSON.stringify(res) : res,
          {
            headers,
          }
        );
      },
    });
  }
}
