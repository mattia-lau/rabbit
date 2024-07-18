import type { IContext, IInterceptor } from "@rabbit/common";

export class LoggingMiddleware implements IInterceptor {
  start = new Date();

  pre(ctx: IContext): void | Promise<void> {
    this.start = new Date();
  }

  post(ctx: IContext): void | Promise<void> {
    const taken = Date.now() - this.start.getTime();
    console.log("End", taken / 1000, "s");

    ctx.res.headers.set("X-Response-Time", `${taken}`);
  }
}
