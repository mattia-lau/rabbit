import type { Adapater } from "../adapter/base.adapter";
import type { Constructor } from "./constructor.interface";
import type { IInterceptor } from "./interceptor.interface";

export interface ApplicationOptions {
  compress?: boolean;
  adapter: Constructor<Adapater>;
  interceptors?: Constructor<IInterceptor>[];
  hostname?: string;
  responseHandler?: (event: string, res: any[]) => Promise<any>;
}
