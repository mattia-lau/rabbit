import { createParamDecorator } from "@rabbit/core";
import {
  DECORATOR_KIND_METADATA,
  DecoratorKind,
  GRAPHQL,
} from "@rabbit/internal";

export const Reference = () => {
  return createParamDecorator((ctx) => ctx[GRAPHQL].reference, {
    [DECORATOR_KIND_METADATA]: DecoratorKind.Reference,
  });
};
