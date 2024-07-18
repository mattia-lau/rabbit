import { ApolloGateway } from "@apollo/gateway";
import { ApolloServer, type ApolloServerOptions } from "@apollo/server";
import { Adapter, Kind, type Constructor, type IContext } from "@rabbit/common";
import { Body, Context, pathToEvent } from "@rabbit/core";
import { GRAPHQL } from "@rabbit/internal";
import { buildGraphQLSchema } from "./factory/build-graphql.ts";
import type { IGraphQLAdapterOptions } from "./server.ts";

export type IApolloAdapterOptions = (
  | ApolloSubGraphOptions
  | ApolloGatewayOptions
) & { adapter: Constructor<Adapter> } & Omit<
    ApolloServerOptions<any>,
    "schema" | "gateway" | "typeDefs" | "resolvers"
  >;

export type ApolloSubGraphOptions = {
  version?: "v2.0" | "v2.3";
  orphanedTypes?: Constructor[];
};

type ApolloGatewayOptions = {
  gateway: ApolloGateway;
};

export class ApolloGraphQLAdapter extends Adapter<IGraphQLAdapterOptions> {
  kind: Kind = Kind.Apollo;
  apollo: ApolloServer;

  constructor(private readonly options: IApolloAdapterOptions) {
    super();

    if ("gateway" in options) {
      const { gateway, adapter, ...rest } = options;

      this.apollo = new ApolloServer({
        gateway,
        ...rest,
      });
    } else {
      const { orphanedTypes, adapter, version, ...rest } = options;
      const schema = buildGraphQLSchema(options);

      this.apollo = new ApolloServer({
        schema,
        ...rest,
      });
    }
  }

  async handle(@Body() body: any, @Context() ctx: IContext) {
    const res = await (
      ctx[GRAPHQL].apollo as ApolloServer
    ).executeHTTPGraphQLRequest({
      httpGraphQLRequest: {
        body,
        // @ts-ignore
        headers: ctx.req.headers,
        method: ctx.req.method,
        search: "",
      },
      context: async () => ctx,
    });

    res.headers.forEach((val, key) => {
      ctx.res.headers.set(key, val);
    });

    if (res.body.kind === "chunked") {
      throw new Error("unsupport type");
    }

    return JSON.parse(res.body.string);
  }

  createServer(options: IGraphQLAdapterOptions): void {
    const event = pathToEvent("/graphql/", "POST");
    const opts = pathToEvent("/graphql/", "OPTIONS");

    [event, opts].forEach((path) => {
      options.application.on(path, this.handle);
      options.application.setRef(path, this);
    });

    const adapter = new this.options.adapter();

    adapter.createServer({
      ...options,
      makeContext: async (ctx) => {
        ctx[GRAPHQL] = {
          apollo: this.apollo,
        };
        return ctx;
      },
    });

    this.apollo.start();
  }
}
