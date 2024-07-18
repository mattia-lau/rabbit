import {
  DECORATOR_KIND_METADATA,
  DecoratorKind,
  QUERY_METADATA,
} from "@rabbit/internal";
import type { QueryOptions } from "../types/query-options";
import type { ReturnTypeFunc } from "../types/return-type";

export const Query = (
  returnType: ReturnTypeFunc,
  options?: QueryOptions
): MethodDecorator => {
  return (target, propertyKey, descriptor) => {
    Reflect.defineMetadata(
      DECORATOR_KIND_METADATA,
      DecoratorKind.Query,
      descriptor.value as any
    );

    Reflect.defineMetadata(
      QUERY_METADATA,
      { returnType, options },
      descriptor.value as any
    );
  };
};
