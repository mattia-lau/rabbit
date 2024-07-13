import { IContext } from "@rabbit/common";

export interface IAuthGuard {
  canActive(ctx: IContext): boolean | Promise<boolean>;
}
