import "./src/setup";

import { createApplication } from "@rabbit/core";
import { BunAdapter } from "../bun-adapter";
import { CORSMiddleware } from "./src/middlewares/cors.middleware";
import { JwtMiddleware } from "./src/middlewares/jwt.middleware";

createApplication({
  adapter: BunAdapter,
  compress: true,
  interceptors: [JwtMiddleware, CORSMiddleware],
});
