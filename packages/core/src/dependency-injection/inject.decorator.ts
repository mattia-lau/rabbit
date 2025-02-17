import { type Constructor } from "@rabbit/common";
import { DEPENDENCY_INJECTION_METADATA } from "@rabbit/internal";

export const Inject = (clazz: Constructor): ParameterDecorator => {
  return (target: any, key: any, index) => {
    const params =
      Reflect.getMetadata(DEPENDENCY_INJECTION_METADATA, target) ?? [];

    Reflect.defineMetadata(
      DEPENDENCY_INJECTION_METADATA,
      [...params, { index, symbol: clazz }],
      target
    );
  };
};
