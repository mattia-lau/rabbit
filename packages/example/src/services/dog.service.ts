import { Inject } from "@rabbit/core";
import { ConfigService } from "./config.service";

export class DogService {
  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService
  ) {}

  bark() {
    return "Woof!";
  }
}
