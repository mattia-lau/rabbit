import type { Constructor, IInterceptor } from "@rabbit/common";
import { INTERCEPTOR_METADATA } from "@rabbit/internal";

export const UseInterceptor = (
  ...interceptors: Constructor<IInterceptor>[]
): MethodDecorator => {
  return (target, propertyKey, descriptor) => {
    const values =
      Reflect.getMetadata(INTERCEPTOR_METADATA, descriptor.value as any) ?? [];

    Reflect.defineMetadata(
      INTERCEPTOR_METADATA,
      [...values, ...interceptors],
      descriptor.value as any
    );
  };
};
