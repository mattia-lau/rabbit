import { IContext } from "@rabbit/common";
import { Context, IAuthGuard, Inject } from "@rabbit/core";
import { ConfigService } from "../services/config.service";

export class AuthGuard implements IAuthGuard {
  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService
  ) {}

  canActive(@Context() ctx: IContext): boolean | Promise<boolean> {
    const { user } = ctx;

    return user != null;
  }
}
