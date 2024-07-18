import { createParamDecorator } from "@rabbit/core";
import {
  DECORATOR_KIND_METADATA,
  DecoratorKind,
  GRAPHQL,
} from "@rabbit/internal";

export const Parent = () =>
  createParamDecorator(
    (ctx) => {
      return ctx[GRAPHQL].parent;
    },
    {
      [DECORATOR_KIND_METADATA]: DecoratorKind.Parent,
    }
  );
