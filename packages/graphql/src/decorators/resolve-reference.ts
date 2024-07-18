import type { Constructor } from "@rabbit/common";
import {
  DECORATOR_KIND_METADATA,
  DecoratorKind,
  RESOLVE_REFERENCE_METADATA,
} from "@rabbit/internal";
import type { GraphQLScalarType } from "graphql";

type Options = () => Constructor | GraphQLScalarType | any;

export const ResolveReference = (options: Options): MethodDecorator => {
  return (target, propertyKey, descriptor: any) => {
    const resolveFields =
      Reflect.getMetadata(RESOLVE_REFERENCE_METADATA, target.constructor) ?? [];

    Reflect.defineMetadata(
      DECORATOR_KIND_METADATA,
      DecoratorKind.ResolveReference,
      target
    );

    Reflect.defineMetadata(
      RESOLVE_REFERENCE_METADATA,
      [
        ...resolveFields,
        {
          type: options,
          parent: target.constructor,
          key: propertyKey,
        },
      ],
      target.constructor
    );
  };
};
