import { ApolloGateway, IntrospectAndCompose } from "@apollo/gateway";
import type { IContext } from "@rabbit/common";
import { createApplication } from "@rabbit/core";
import { ApolloGraphQLAdapter } from "@rabbit/graphql";
import { NodeAdapter } from "@rabbit/node-adapter";

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: "users", url: "http://localhost:3002/graphql" },
      { name: "posts", url: "http://localhost:3001/graphql" },
    ],
  }),
});

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
    gateway,
    adapter: NodeAdapter,
  }),
  compress: true,
  responseHandler: async (event, res) => {
    return res[0];
  },
  interceptors: [CORSMiddleware],
  port: 3000,
});
