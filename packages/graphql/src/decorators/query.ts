import type { Constructor } from "@rabbit/common";
import { QUERY_METADATA } from "../metadata/symbol";

type Options = () => Constructor;

export const Query = (options: Options): MethodDecorator => {
  return (target, propertyKey, descriptor) => {
    Reflect.defineMetadata(QUERY_METADATA, options, descriptor.value as any);
  };
};
