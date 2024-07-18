import type { Constructor } from "@rabbit/common";
import type { GraphQLOutputType } from "graphql";

export type ReturnTypeFunc = (
  of: unknown
) =>
  | Constructor
  | [Constructor]
  | GraphQLOutputType
  | [GraphQLOutputType]
  | Function
  | [Function];
