import { Controller, Get, Inject, Params } from "@rabbit/core";
import { AuthService } from "../services/auth.service";

@Controller("/users")
export class UserController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Get("/:id")
  // @UseAuthGuard(AuthGuard)
  async getUser(@Params("id") id: string) {
    return {
      id,
    };
  }
}
