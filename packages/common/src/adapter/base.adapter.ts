import type { ApplicationOptions } from "../interfaces/application-options.interface";
import type { IApplication } from "../interfaces/application.interface";
import type { IContext } from "../interfaces/context.interface";
import type { IInterceptor } from "../interfaces/interceptor.interface";

export type IAdapterOptions = {
  application: IApplication<IContext>;
  interceptors: IInterceptor[];
} & Omit<ApplicationOptions, "adapter" | "interceptors">;

export class Adapater {
  constructor() {}

  createServer(options: IAdapterOptions) {}
}
