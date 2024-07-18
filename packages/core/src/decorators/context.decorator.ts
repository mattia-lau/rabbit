import { DECORATOR_KIND_METADATA, DecoratorKind } from "@rabbit/internal";
import { createParamDecorator } from ".";

export const Context = (): ParameterDecorator => {
  return createParamDecorator((ctx) => ctx, {
    [DECORATOR_KIND_METADATA]: DecoratorKind.Context,
  });
  // return (target: any, propertyKey: any, index) => {
  //   Reflect.defineMetadata(CONTEXT_METADATA, { index }, target[propertyKey]);
  // };
};
