import type { IContext } from "@rabbit/common";
import { createApplication } from "@rabbit/core";
import { ApolloGraphQLAdapter } from "@rabbit/graphql";
import { NodeAdapter } from "@rabbit/node-adapter";

import "./src/user.resolver";

export class CORSMiddleware {
  constructor() {}

  async pre(ctx: IContext) {
    ctx.res.headers.set("Access-Control-Allow-Origin", "*");
    ctx.res.headers.set("Access-Control-Allow-Headers", "*");
  }

  post(ctx: IContext): void | Promise<void> {}
}

createApplication({
  adapter: new ApolloGraphQLAdapter({
    adapter: NodeAdapter,
    version: "v2.3",
  }),
  compress: true,
  responseHandler: async (event, res) => {
    return res[0];
  },
  interceptors: [CORSMiddleware],
  port: 3002,
});
