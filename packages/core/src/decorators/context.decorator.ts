import { CONTEXT_METADATA } from "../utils/symbols";

export const Context = (): ParameterDecorator => {
  return (target: any, propertyKey: any, index) => {
    Reflect.defineMetadata(CONTEXT_METADATA, { index }, target[propertyKey]);
  };
};
