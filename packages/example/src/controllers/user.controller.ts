import {
  Controller,
  Get,
  Header,
  Inject,
  Params,
  UseAuthGuard,
} from "@rabbit/core";
import { AuthGuard } from "../guards/auth.guard";
import { AuthService } from "../services/auth.service";

@Controller("/users")
export class UserController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Get("/:id")
  @UseAuthGuard(AuthGuard)
  @Header("Access-Control-Allow-Origin", "*")
  async getUser(@Params("id") id: string) {
    return {
      id,
    };
  }
}
