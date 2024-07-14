import {
  Adapater,
  GraphQLBaseAdapter,
  type Constructor,
  type IGraphQLAdapterOptions,
  type IContext,
} from "@rabbit/common";
import { Body, Context, pathToEvent, type IAuthGuard } from "@rabbit/core";
import { GraphQLSchema, graphql, parse, Kind } from "graphql";
import { buildGraphQLSchema } from ".";

export class GraphQLAdapter extends GraphQLBaseAdapter {
  schema: GraphQLSchema;

  constructor(private readonly adapter: Constructor<Adapater>) {
    super();

    this.schema = buildGraphQLSchema();
  }

  async handle(@Body() body: any, @Context() ctx: IContext) {
    const res = await graphql({
      schema: this.schema,
      source: body.query,
      contextValue: ctx,
    });
    return res;
  }

  createServer(options: IGraphQLAdapterOptions): void {
    const event = pathToEvent("/graphql", "POST");
    options.application.on(event, this.handle);
    options.application.setRef(event, this);
    const adapter = new this.adapter();

    adapter.createServer({
      ...options,
      makeContext: async (ctx) => {
        return {
          handleAuthGuard: (guards: Constructor<IAuthGuard>) => {
            ctx._authGuards = guards;

            return options.application.emitInternal("rabbit__auth_guard", ctx);
          },
        };
      },
    });
  }
}
