import { OBJECT_TYPE_METADATA } from "@rabbit/internal";

type Options = {
  interfaces?: () => any[];
};

export const ObjectType = (options?: Options): ClassDecorator => {
  return (target) => {
    const types = Reflect.getMetadata(OBJECT_TYPE_METADATA, global) ?? [];

    Reflect.defineMetadata(
      OBJECT_TYPE_METADATA,
      [...types, { target, options }],
      global
    );
  };
};
