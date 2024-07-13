import { IContext, IInterceptor } from "@rabbit/common";

export class CORSMiddleware implements IInterceptor {
  constructor() {}

  async pre(ctx: IContext) {
    ctx.res.headers.set("Access-Control-Allow-Origin", "*");
  }

  post(ctx: IContext): void | Promise<void> {}
}
