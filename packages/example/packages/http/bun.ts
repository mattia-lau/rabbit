import "./src/setup";

import { BunAdapter } from "@rabbit/bun-adapter";
import { createApplication } from "@rabbit/core";
import { CORSMiddleware } from "./src/middlewares/cors.middleware";
import { JwtMiddleware } from "./src/middlewares/jwt.middleware";

createApplication({
  adapter: BunAdapter,
  compress: true,
  interceptors: [JwtMiddleware, CORSMiddleware],
  port: 3000,
});
