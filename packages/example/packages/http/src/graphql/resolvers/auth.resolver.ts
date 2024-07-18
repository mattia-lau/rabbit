import { Inject } from "@rabbit/core";
import { Args, Mutation, Resolver } from "@rabbit/graphql";
import { AuthService } from "../../services/auth.service";
import { Tokens } from "../models/tokens.type";
import { LoginInput } from "../inputs/login.input";

@Resolver()
export class AuthResolver {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService
  ) {}

  @Mutation(() => Tokens)
  async login(@Args("input", { type: () => LoginInput }) input: LoginInput) {
    const jwt = await this.authService.login(input.username, input.password);

    return jwt;
  }
}
