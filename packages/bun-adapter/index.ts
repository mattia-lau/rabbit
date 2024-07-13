import {
  Adapater,
  compress,
  type IAdapterOptions,
  type IContext,
} from "@rabbit/common";
import "reflect-metadata";

export class BunAdapter extends Adapater {
  createServer(options: IAdapterOptions): void {
    const { application, ...rest } = options;

    Bun.serve({
      port: 3000,
      fetch: async (request) => {
        let { pathname } = new URL(request.url);
        if (pathname.charAt(pathname.length - 1) !== "/") {
          pathname = `${pathname}/`;
        }

        const event = `${request.method.toUpperCase()}__${pathname}`;

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

        let res = await application.emitAsync(event, ctx).catch((err) => {
          return [
            new Response(err.message, {
              status: err.statusCode,
            }),
          ];
        });

        if (res.length === 1) {
          res = res[0];
        }

        if (res instanceof Response) {
          return res;
        }

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
