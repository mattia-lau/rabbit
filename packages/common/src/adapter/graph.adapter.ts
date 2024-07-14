import type {
  ApplicationOptions,
  Constructor,
  IApplication,
  IContext,
  IInterceptor,
} from "../interfaces";
import { Adapater } from "./base.adapter";

export type IGraphQLAdapterOptions = {
  application: IApplication<IContext>;
  interceptors: IInterceptor[];
  adapter: Constructor<Adapater>;
} & Omit<ApplicationOptions, "adapter" | "interceptors">;

export abstract class GraphQLBaseAdapter extends Adapater<IGraphQLAdapterOptions> {
  kind = "GraphQL";
}
