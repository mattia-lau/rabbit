import type { IContext, IInterceptor } from "@rabbit/common";

export class CORSInterceptor implements IInterceptor {
  constructor() {}

  async pre(ctx: IContext) {
    ctx.res.headers.set("Access-Control-Allow-Origin", "*");
  }

  post(ctx: IContext): void | Promise<void> {}
}
