import type {
  ApplicationOptions,
  Constructor,
  IApplication,
  IContext,
} from "@rabbit/common";
import { resolveDI } from "..";
import { getContainer } from "../dependency-injection/container";
import { IsConstructor } from "../utils/is-constructor";
import { IsFunction } from "../utils/is-function";
import {
  CONTROLLER_METADATA,
  DEPENDENCY_INJECTION_METADATA,
  METHOD_METADATA,
  PATH_METADATA,
  USE_AUTH_GUARD_METADATA,
} from "../utils/symbols";
import { RabbitEventEmitter } from "./event-emitter";
import { pathToEvent } from "../utils/path-to-event";

export class Application implements IApplication<any> {
  private eventEmitter = new RabbitEventEmitter();

  constructor(
    private readonly options: Pick<ApplicationOptions, "responseHandler">
  ) {}

  init() {
    const controllers: Constructor[] =
      Reflect.getMetadata(CONTROLLER_METADATA, global) ?? [];

    controllers.forEach((controller) => {
      const instance = new controller(...resolveDI(controller));
      const prototype = Object.getPrototypeOf(instance);
      const methodsNames = Object.getOwnPropertyNames(prototype).filter(
        (item) => !IsConstructor(item) && IsFunction(prototype[item])
      );
      const rootPath = Reflect.getMetadata(PATH_METADATA, instance.constructor);

      methodsNames.forEach((methodName) => {
        let fn = instance[methodName];
        const route = Reflect.getMetadata(PATH_METADATA, fn);
        const method = Reflect.getMetadata(METHOD_METADATA, fn);
        const guards: any[] =
          Reflect.getMetadata(USE_AUTH_GUARD_METADATA, fn) ?? [];
        const path = pathToEvent(`${rootPath}${route}`, method);
        this.eventEmitter.setGuards(path, guards);

        // To bind this ref
        this.eventEmitter.setRef(path, instance);
        this.eventEmitter.on(path, fn);
      });
    });

    return this;
  }

  async emitAsync(event: string, ctx: IContext) {
    const res = await this.eventEmitter.emitAsync(event, ctx);

    if (this.options.responseHandler) {
      return this.options.responseHandler(event, res);
    }

    if (res.length === 1) {
      return res[0];
    }

    return res;
  }

  async on(event: string, listener: any) {
    return this.eventEmitter.on(event, listener);
  }

  setRef(path: string, ref: Constructor<any>) {
    this.eventEmitter.setRef(path, ref);
  }

  async emitInternal(event: string, ctx: IContext) {
    return this.eventEmitter.emitInternal(event, ctx);
  }
}
