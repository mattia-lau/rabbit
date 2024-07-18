import { Body, Controller, Headers, Inject, Post } from "@rabbit/core";
import { AuthService } from "../services/auth.service";

type Credentials = {
  username: string;
  password: string;
};

@Controller("/auth")
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post("/")
  async login(@Body() body: Credentials, @Headers("host") host: string) {
    return this.authService.login(body.username, body.password);
  }
}
