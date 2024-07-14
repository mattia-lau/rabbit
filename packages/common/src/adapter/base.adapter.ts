import type { ApplicationOptions } from "../interfaces/application-options.interface";
import type { IApplication } from "../interfaces/application.interface";
import type { IContext } from "../interfaces/context.interface";
import type { IInterceptor } from "../interfaces/interceptor.interface";

export type IAdapterOptions = {
  application: IApplication<IContext>;
  interceptors: IInterceptor[];
  makeContext?: (ctx: IContext) => Promise<any>;
} & Omit<ApplicationOptions, "adapter" | "interceptors">;

export class Adapater<T = IAdapterOptions> {
  kind = "HTTP";

  constructor() {}

  createServer(options: T) {}
}
