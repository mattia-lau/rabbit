import { OBJECT_TYPE_METADATA } from "../metadata/symbol";

export const ObjectType = (): ClassDecorator => {
  return (target) => {
    Reflect.defineMetadata(OBJECT_TYPE_METADATA, "", target);

    Reflect.defineMetadata(
      OBJECT_TYPE_METADATA,
      [...(Reflect.getMetadata(OBJECT_TYPE_METADATA, global) ?? []), target],
      global
    );
  };
};
