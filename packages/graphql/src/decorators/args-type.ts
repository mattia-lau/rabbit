import { ARGS_TYPE_METADATA } from "@rabbit/internal";

export const ArgsType = (): ClassDecorator => {
  return (target) => {
    Reflect.defineMetadata(ARGS_TYPE_METADATA, "", target);

    Reflect.defineMetadata(
      ARGS_TYPE_METADATA,
      [...(Reflect.getMetadata(ARGS_TYPE_METADATA, global) ?? []), target],
      global
    );
  };
};
