import type { GraphQLFieldConfig } from "graphql";

export type QueryOptions = Pick<
  GraphQLFieldConfig<any, any, any>,
  "deprecationReason" | "description"
>;
