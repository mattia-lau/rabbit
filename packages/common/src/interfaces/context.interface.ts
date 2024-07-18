import type { RABBIT_GLOBA_INTERCEPTOR } from "@rabbit/internal";
import type { IApplication } from ".";
import type { IInterceptor } from "./interceptor.interface";

export type IContext<Body = any> = {
  application: IApplication<IContext>;
  req: { body: any; params?: Record<string, unknown> } & Pick<
    Request,
    "headers" | "signal" | "method"
  >;
  event: string;
  res: { body: Body; headers: Headers; status: number };
  [RABBIT_GLOBA_INTERCEPTOR]: IInterceptor[];
} & Record<string | symbol, any>;
