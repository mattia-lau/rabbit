import {
  Adapter,
  compress,
  createContext,
  type IAdapterOptions,
} from "@rabbit/common";

export class BunAdapter extends Adapter {
  createServer(options: IAdapterOptions): void {
    const { application, port, ...rest } = options;

    Bun.serve({
      port,
      fetch: async (request) => {
        const ctx = await createContext(options, request);

        const res = await application.emitAsync(ctx.event, ctx).catch((err) => {
          ctx.res.body = err.message;
          ctx.res.status = err.statusCode;

          return err.message;
        });

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
