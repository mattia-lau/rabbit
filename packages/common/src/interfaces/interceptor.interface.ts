import type { IContext } from "./context.interface";

export interface IInterceptor {
  pre(ctx: IContext): void | Promise<void>;
  post(ctx: IContext): void | Promise<void>;
}
