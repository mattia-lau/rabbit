import { createParamDecorator } from "@rabbit/core";
import {
  DECORATOR_KIND_METADATA,
  DecoratorKind,
  GRAPHQL,
} from "@rabbit/internal";

export const Info = () =>
  createParamDecorator(
    (ctx) => {
      return ctx[GRAPHQL].info;
    },
    {
      [DECORATOR_KIND_METADATA]: DecoratorKind.Info,
    }
  );
