import { INPUT_TYPE_METADATA } from "@rabbit/internal";

type Options = {};

export const InputType = (options?: Options): ClassDecorator => {
  return (target) => {
    const types = Reflect.getMetadata(INPUT_TYPE_METADATA, global) ?? [];

    Reflect.defineMetadata(
      INPUT_TYPE_METADATA,
      [...types, { target, options }],
      global
    );
  };
};
