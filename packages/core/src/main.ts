import {
  Kind,
  type ApplicationOptions,
  Adapter as BaseAdapter,
} from "@rabbit/common";
import { Application } from "./core/application";
import { resolveDI } from "./dependency-injection";

export const createApplication = (options: ApplicationOptions) => {
  let Adapter = options.adapter;

  // @ts-ignore
  if (options.adapter.kind !== Kind.Http) {
    Adapter = options.adapter;
  } else {
    // @ts-ignore
    Adapter = new options.adapter();
  }

  const application = new Application(options).init();

  const interceptors = (options.interceptors ?? []).map(
    (e) => new e(...resolveDI(e))
  );

  return (Adapter as BaseAdapter).createServer({
    ...options,
    application,
    interceptors,
  });
};
