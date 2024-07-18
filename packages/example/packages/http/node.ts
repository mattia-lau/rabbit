import "./src/setup";

import { createApplication } from "@rabbit/core";
import { NodeAdapter } from "@rabbit/node-adapter";
import { CORSMiddleware } from "./src/middlewares/cors.middleware";
import { JwtMiddleware } from "./src/middlewares/jwt.middleware";

createApplication({
  adapter: NodeAdapter,
  compress: true,
  interceptors: [JwtMiddleware, CORSMiddleware],
  responseHandler: async (event, res) => {
    return res;
  },
  port: 3000,
});
