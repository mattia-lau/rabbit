import "./src/setup";

import { createApplication } from "@rabbit/core";
import { NodeAdapter } from "../node-adapter";
import { CORSMiddleware } from "./src/middlewares/cors.middleware";
import { JwtMiddleware } from "./src/middlewares/jwt.middleware";

createApplication({
  adapter: NodeAdapter,
  compress: true,
  interceptors: [JwtMiddleware, CORSMiddleware],
});
