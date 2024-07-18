import type { Adapter } from "../adapter/base.adapter";
import type { Constructor } from "./constructor.interface";
import type { IInterceptor } from "./interceptor.interface";

export interface ApplicationOptions {
  port?: number;

  compress?: boolean;
  adapter: Constructor<Adapter> | Adapter;
  interceptors?: Constructor<IInterceptor>[];
  hostname?: string;
  responseHandler?: (event: string, res: any[]) => Promise<any>;
}
