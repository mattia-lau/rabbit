import "./src/setup";

import { createApplication } from "@rabbit/core";
import { NodeAdapter } from "@rabbit/node-adapter";
import { CORSInterceptor } from "./src/interceptors/cors.interceptor";
import { JwtInterceptor } from "./src/interceptors/jwt.interceptor";

createApplication({
  adapter: NodeAdapter,
  compress: true,
  interceptors: [JwtInterceptor, CORSInterceptor],
  responseHandler: async (event, res) => {
    return res;
  },
  port: 3000,
});
