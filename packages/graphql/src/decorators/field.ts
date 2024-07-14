import { FIELD_METADATA } from "../metadata/symbol";

type Options = () => any;

export const Field = (option: Options): PropertyDecorator => {
  return (target, key) => {
    const fields = Reflect.getMetadata(FIELD_METADATA, target) ?? {};

    Reflect.defineMetadata(
      FIELD_METADATA,
      { ...fields, [key]: option() },
      target
    );
  };
};
