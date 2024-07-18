import "./src/setup";

import { BunAdapter } from "@rabbit/bun-adapter";
import { createApplication } from "@rabbit/core";
import { CORSInterceptor } from "./src/interceptors/cors.interceptor";
import { JwtInterceptor } from "./src/interceptors/jwt.interceptor";

createApplication({
  adapter: BunAdapter,
  compress: true,
  interceptors: [JwtInterceptor, CORSInterceptor],
  port: 3000,
});
