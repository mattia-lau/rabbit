import { DIRECTIVE_METADATA } from "@rabbit/internal";
import { parse } from "graphql";

export const Directive = (
  sdl: string
): MethodDecorator & PropertyDecorator & ClassDecorator => {
  validateDirective(sdl);

  return (target: Function | Object, key?: string | symbol, c?: any) => {
    if (key) {
      const directives =
        Reflect.getMetadata(DIRECTIVE_METADATA, target.constructor) ?? [];

      Reflect.defineMetadata(
        DIRECTIVE_METADATA,
        [...directives, { target: target.constructor, sdl, key }],
        target.constructor
      );
    } else {
      const directives = Reflect.getMetadata(DIRECTIVE_METADATA, target) ?? [];

      Reflect.defineMetadata(
        DIRECTIVE_METADATA,
        [...directives, { target, sdl }],
        target
      );
    }
  };
};

const validateDirective = (sdl: string) => {
  try {
    parse(`type String ${sdl}`);
  } catch (err) {
    throw new Error(sdl);
  }
};
