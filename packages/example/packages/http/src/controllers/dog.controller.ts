import {
  Context,
  Controller,
  Get,
  Header,
  Inject,
  Post,
  UseAuthGuard,
  UseInterceptor,
} from "@rabbit/core";
import { AuthGuard } from "../guards/auth.guard";
import { LoggingInterceptor } from "../interceptors/logging.interceptor";
import { DogService } from "../services/dog.service";

@Controller("/dogs")
export class DogController {
  constructor(@Inject(DogService) private readonly dogService: DogService) {}

  @Get("/")
  @Header("Cache-Control", "no-cache")
  woof(@Context() ctx: any) {
    return this.dogService.bark();
  }

  @Post("/")
  @UseAuthGuard(AuthGuard)
  @UseInterceptor(LoggingInterceptor)
  dog() {
    return "";
  }
}
