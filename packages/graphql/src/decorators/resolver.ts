import { RESOLVER_METADATA } from "@rabbit/internal";
import type { ReturnTypeFunc } from "../types/return-type";

export const Resolver = (parent?: ReturnTypeFunc): ClassDecorator => {
  return (target) => {
    const resolvers = Reflect.getMetadata(RESOLVER_METADATA, global) ?? [];

    Reflect.defineMetadata(
      RESOLVER_METADATA,
      [...resolvers, { resolver: target, parent }],
      global
    );
  };
};
