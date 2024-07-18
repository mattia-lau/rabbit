import { DecoratorKind, PARAMS_METADATA } from "@rabbit/internal";
import { createParamDecorator } from ".";

export const Params = (key?: string): ParameterDecorator => {
  return createParamDecorator(
    (ctx) => {
      return !key ? ctx.req.params : ctx.req?.params?.[key];
    },
    {
      kind: DecoratorKind.Params,
    }
  );
  // return (target: any, propertyKey: any, index) => {
  //   const params =
  //     Reflect.getMetadata(PARAMS_METADATA, target[propertyKey]) ?? [];

  //   Reflect.defineMetadata(
  //     PARAMS_METADATA,
  //     [...params, { index, key }],
  //     target[propertyKey]
  //   );
  // };
};
