import type { Constructor, IContext } from "@rabbit/common";
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

export class Application {
  private eventEmitter = new RabbitEventEmitter();

  constructor() {}

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
        const guards: any[] = Reflect.getMetadata(USE_AUTH_GUARD_METADATA, fn);
        const path = `${method}__${rootPath}${route}`;

        if (guards) {
          const injectGuards = guards.map((guard) => {
            const parameterTypes: any[] =
              Reflect.getMetadata(DEPENDENCY_INJECTION_METADATA, guard) ?? [];

            const constructorValues = new Array(parameterTypes.length);
            const container = getContainer();
            parameterTypes.forEach((_, index) => {
              const service = container.resolve(parameterTypes[index].symbol);
              constructorValues[index] = service;
            });

            return new guard(...constructorValues);
          });

          this.eventEmitter.setGuards(path, injectGuards);
        }

        // To bind this ref
        this.eventEmitter.setRef(path, instance);
        this.eventEmitter.on(path, fn);
      });
    });

    return this;
  }

  async emitAsync(event: string, ctx: IContext) {
    return this.eventEmitter.emitAsync(event, ctx);
  }
}
