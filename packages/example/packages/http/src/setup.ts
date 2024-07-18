import { register } from "@rabbit/core";
import { AuthService } from "./services/auth.service";
import { ConfigService } from "./services/config.service";
import { DatabaseService } from "./services/database.service";
import { DogService } from "./services/dog.service";
import "./controllers/auth.controller";
import "./controllers/dog.controller";
import "./controllers/user.controller";

register(ConfigService, (ctx) => {
  return new ConfigService();
});

register(DogService, (ctx) => {
  const configService = ctx.resolve(ConfigService);

  return new DogService(configService);
});

register(DatabaseService, (ctx) => {
  const configService = ctx.resolve(ConfigService);

  return new DatabaseService(configService.get("databaseUrl"));
});

register(AuthService, (ctx) => {
  const configService = ctx.resolve(ConfigService);
  const databaseService: DatabaseService = ctx.resolve(DatabaseService);

  return new AuthService(configService, databaseService);
});
