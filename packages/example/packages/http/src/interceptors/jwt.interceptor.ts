import type { IContext, IInterceptor } from "@rabbit/common";
import { Inject } from "@rabbit/core";
import { AuthService } from "../services/auth.service";

export class JwtInterceptor implements IInterceptor {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  async pre(ctx: IContext) {
    const authorization = ctx.req.headers.get("authorization");
    if (!authorization) {
      ctx.user = null;
      return;
    }

    const [_, token] = (authorization ?? "").split(" ");

    const user = await this.authService.verify(token);
    ctx.user = user;
  }

  post(ctx: IContext): void | Promise<void> {}
}
