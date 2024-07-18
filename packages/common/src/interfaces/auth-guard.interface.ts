import { type IContext } from "./context.interface";

export interface IAuthGuard {
  canActive(ctx: IContext): boolean | Promise<boolean>;
}
