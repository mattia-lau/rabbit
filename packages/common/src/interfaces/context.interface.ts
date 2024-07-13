import type { IInterceptor } from "./interceptor.interface";

export type IContext<Body = any> = {
  req: Request;
  event: string;
  res: { body: Body; headers: Headers; status: number };
  interceptors?: IInterceptor[];
} & Record<string, any>
