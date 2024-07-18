import { FIELD_METADATA } from "@rabbit/internal";

type Options = {
  nullable?: boolean;
  defaultValue?: any;
};

type ReturnType = () => any;

export const Field = (
  type: ReturnType,
  options?: Options
): PropertyDecorator => {
  return (target, key) => {
    const fields = Reflect.getMetadata(FIELD_METADATA, target.constructor) ?? {};

    Reflect.defineMetadata(
      FIELD_METADATA,
      { ...fields, [key]: { type: type(), ...options } },
      target.constructor
    );
  };
};
