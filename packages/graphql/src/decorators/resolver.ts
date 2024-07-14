import { RESOLVER_METADATA } from "../metadata/symbol";

export const Resolver = (): ClassDecorator => {
  return (target) => {
    const resolvers = Reflect.getMetadata(RESOLVER_METADATA, target) ?? [];

    Reflect.defineMetadata(RESOLVER_METADATA, [...resolvers, target], global);
  };
};
