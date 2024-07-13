import type { ApplicationOptions } from "@rabbit/common";
import { Application } from "./core/application";
import { resolveDI } from "./dependency-injection";

export const createApplication = (options: ApplicationOptions) => {
  const Adapter = new options.adapter();

  const application = new Application(options).init();

  const interceptors = (options.interceptors ?? []).map(
    (e) => new e(...resolveDI(e))
  );

  return Adapter.createServer({
    ...options,
    application,
    interceptors,
  });
};
