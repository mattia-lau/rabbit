import { IContext, IInterceptor } from "@rabbit/common";

export class LoggingMiddleware implements IInterceptor {
  start = new Date();

  pre(ctx: IContext): void | Promise<void> {
    this.start = new Date();
  }

  post(ctx: IContext): void | Promise<void> {
    console.log("End", (Date.now() - this.start.getTime()) / 1000, "s");
  }
}
