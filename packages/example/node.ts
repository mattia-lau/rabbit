import "./src/setup";

import { createApplication } from "@rabbit/core";
import { CORSMiddleware } from "./src/middlewares/cors.middleware";
import { JwtMiddleware } from "./src/middlewares/jwt.middleware";
import { NodeAdapter } from "@rabbit/node-adapter";

createApplication({
  adapter: NodeAdapter,
  compress: true,
  interceptors: [JwtMiddleware, CORSMiddleware],
  responseHandler: async (event, res) => {
    return res;
  },
});
