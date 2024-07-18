import {
  DecoratorKind,
  HEADER_METADATA,
  METHOD_METADATA,
  PATH_METADATA,
} from "@rabbit/internal";
import { createParamDecorator } from ".";

const createMappingDecorator =
  (method: string) =>
  (path: string): MethodDecorator => {
    return (target, key, descriptor) => {
      Reflect.defineMetadata(PATH_METADATA, path, descriptor.value as any);
      Reflect.defineMetadata(METHOD_METADATA, method, descriptor.value as any);
    };
  };

export const Headers = (name: string): ParameterDecorator => {
  return createParamDecorator(
    (ctx) => {
      return ctx.req.headers.get(name);
    },
    {
      kind: DecoratorKind.Headers,
    }
  );
  // return (target: any, propertyKey, index) => {
  //   const headers =
  //     Reflect.getMetadata(HEADERS_METADATA, target[propertyKey as string]) ??
  //     [];

  //   Reflect.defineMetadata(
  //     HEADERS_METADATA,
  //     [...headers, { key: name, index }],
  //     target[propertyKey as string]
  //   );
  // };
};

export const Body = (): ParameterDecorator => {
  return createParamDecorator(
    (ctx) => {
      return ctx.req.body;
    },
    {
      kind: DecoratorKind.Body,
    }
  );
  // return (target: any, propertyKey, index) => {
  //   Reflect.defineMetadata(
  //     BODY_METADATA,
  //     { key: propertyKey, index },
  //     target[propertyKey as string]
  //   );
  // };
};

export const Header = (name: string, value: string): MethodDecorator => {
  return (target, propertyKey, descriptor) => {
    const headers =
      Reflect.getMetadata(HEADER_METADATA, descriptor.value as any) ?? {};

    Reflect.defineMetadata(
      HEADER_METADATA,
      { ...headers, [name]: value },
      descriptor.value as any
    );
  };
};

export const Get = createMappingDecorator("GET");
export const Post = createMappingDecorator("POST");
export const Put = createMappingDecorator("PUT");
export const Patch = createMappingDecorator("PATCH");
export const Delete = createMappingDecorator("DELETE");
export const Head = createMappingDecorator("HEAD");
export const Options = createMappingDecorator("OPTIONS");
