import { createParamDecorator } from "@rabbit/core";
import { DecoratorKind, FIELD_METADATA, GRAPHQL } from "@rabbit/internal";

type Options = {
  type: () => any;
  nullable?: boolean;
};

export const Args = (name: string | Options, options?: Options) => {
  const metadata = {
    type: DecoratorKind.Args,
  };

  Object.assign(
    metadata,
    typeof name !== "string"
      ? {
          options: {
            ...name,
            type: name.type(),
          },
        }
      : {
          name,
          options: {
            ...options,
            type: options?.type(),
          },
        }
  );

  return createParamDecorator((ctx) => {
    if (typeof name === "string") {
      return ctx[GRAPHQL].args[name];
    } else {
      const Type = name.type();
      const Instance = new Type();

      const fields: Record<string, any> =
        Reflect.getMetadata(FIELD_METADATA, Instance) ?? {};

      const res: Record<string, any> = {};

      for (const key of Object.keys(fields)) {
        res[key] = ctx[GRAPHQL].args[key] ?? fields[key]?.defaultValue;
      }

      return res;
    }
  }, metadata);
};
