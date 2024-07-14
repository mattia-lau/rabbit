import { resolveDI } from "@rabbit/core";
import { IsConstructor } from "@rabbit/core/src/utils/is-constructor";
import { IsFunction } from "@rabbit/core/src/utils/is-function";
import {
  GraphQLInt,
  GraphQLObjectType,
  GraphQLSchema,
  type GraphQLFieldConfig,
  type ThunkObjMap,
} from "graphql";
import {
  FIELD_METADATA,
  OBJECT_TYPE_METADATA,
  QUERY_METADATA,
  RESOLVER_METADATA,
} from "../metadata/symbol";

export const buildGraphQLSchema = () => {
  const objectTypes = Reflect.getMetadata(OBJECT_TYPE_METADATA, global);
  const map: Record<any, any> = {};
  for (const objectType of objectTypes) {
    const fields: ThunkObjMap<GraphQLFieldConfig<any, any, any>> = {};

    const metadata = Reflect.getMetadata(FIELD_METADATA, new objectType());
    for (const [key, type] of Object.entries(metadata)) {
      fields[key] = { type: type as any };
    }

    map[objectType] = new GraphQLObjectType({
      name: objectType.name,
      fields,
    });
  }

  const resolvers = Reflect.getMetadata(RESOLVER_METADATA, global) ?? [];

  let rootQuery = new GraphQLObjectType({
    name: "Query",
    fields: {},
  });

  for (const resolver of resolvers) {
    const instance = new resolver(...resolveDI(resolver));
    const prototype = Object.getPrototypeOf(instance);

    const methodsNames = Object.getOwnPropertyNames(prototype).filter(
      (item) => !IsConstructor(item) && IsFunction(prototype[item])
    );

    methodsNames.forEach((method) => {
      const query = Reflect.getMetadata(QUERY_METADATA, instance[method]);
      const returnType = query();

      rootQuery = new GraphQLObjectType({
        name: "Query",
        fields: () => ({
          ...rootQuery["_fields"],
          [method]: {
            type: map[returnType],
            resolve: (...args) => instance[method](...args),
          },
        }),
      });

      // console.log(printSchema(schema));
    });
  }

  const schema = new GraphQLSchema({
    query: rootQuery,
  });

  return schema;
};
