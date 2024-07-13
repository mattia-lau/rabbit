import { Constructor } from "@rabbit/common";
import { IAuthGuard } from "../types";
import { USE_AUTH_GUARD_METADATA } from "../utils/symbols";

export const UseAuthGuard = (
  ...authGaurd: Constructor<IAuthGuard>[]
): MethodDecorator => {
  return (target, propertyKey, descriptor) => {
    const authGuards =
      Reflect.getMetadata(USE_AUTH_GUARD_METADATA, descriptor.value as any) ??
      [];

    Reflect.defineMetadata(
      USE_AUTH_GUARD_METADATA,
      [...authGuards, ...authGaurd],
      descriptor.value as any
    );
  };
};
