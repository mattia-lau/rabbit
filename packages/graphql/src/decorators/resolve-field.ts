import {
  DECORATOR_KIND_METADATA,
  DecoratorKind,
  RESOLVE_FIELD_METADATA,
} from "@rabbit/internal";
import type { QueryOptions } from "../types/query-options";
import type { ReturnTypeFunc } from "../types/return-type";

export const ResolveField = (
  returnType: ReturnTypeFunc,
  options?: QueryOptions
): MethodDecorator => {
  return (target, propertyKey, descriptor: any) => {
    const resolveFields =
      Reflect.getMetadata(RESOLVE_FIELD_METADATA, target) ?? [];

    Reflect.defineMetadata(
      DECORATOR_KIND_METADATA,
      DecoratorKind.ResolveField,
      target
    );

    Reflect.defineMetadata(
      RESOLVE_FIELD_METADATA,
      [
        ...resolveFields,
        {
          type: returnType,
          options,
          parent: target,
          key: propertyKey,
        },
      ],
      target
    );
  };
};
