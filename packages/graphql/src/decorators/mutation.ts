import {
  DECORATOR_KIND_METADATA,
  DecoratorKind,
  MUTATION_METADATA,
} from "@rabbit/internal";
import type { ReturnTypeFunc } from "../types/return-type";

type MutationOptions = {
  description?: string;
};

export const Mutation = (
  returnType: ReturnTypeFunc,
  options?: MutationOptions
): MethodDecorator => {
  return (target, propertyKey, descriptor) => {
    Reflect.defineMetadata(
      DECORATOR_KIND_METADATA,
      DecoratorKind.Mutation,
      descriptor.value as any
    );

    Reflect.defineMetadata(
      MUTATION_METADATA,
      { returnType, options },
      descriptor.value as any
    );
  };
};
