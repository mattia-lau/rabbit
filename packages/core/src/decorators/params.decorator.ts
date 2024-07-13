import { PARAMS_METADATA } from "../utils/symbols";

export const Params = (key?: string): ParameterDecorator => {
  return (target: any, propertyKey: any, index) => {
    const params =
      Reflect.getMetadata(PARAMS_METADATA, target[propertyKey]) ?? [];

    Reflect.defineMetadata(
      PARAMS_METADATA,
      [...params, { index, key }],
      target[propertyKey]
    );
  };
};
