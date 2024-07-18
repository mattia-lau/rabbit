import { createParamDecorator } from "@rabbit/core";

export const User = () =>
  createParamDecorator((ctx) => {
    return ctx.user;
  });
