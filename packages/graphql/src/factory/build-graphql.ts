import { buildSubgraphSchema } from "@apollo/subgraph";
import {
  addTypes,
  appendObjectFields,
  getResolversFromSchema,
  printSchemaWithDirectives,
} from "@graphql-tools/utils";
import type { Constructor, IContext } from "@rabbit/common";
import { resolveDI } from "@rabbit/core";
import { IsConstructor } from "@rabbit/core/src/utils/is-constructor";
import { IsFunction } from "@rabbit/core/src/utils/is-function";
import {
  AUTH_GUARD_METADATA,
  CUSTOM_METADATA,
  DECORATOR_KIND_METADATA,
  DecoratorKind,
  ENUM,
  ENUM_TYPE_METADATA,
  FIELD_METADATA,
  GRAPHQL,
  INTERCEPTOR_METADATA,
  INTERFACE_TYPE_METADATA,
  MUTATION_METADATA,
  OBJECT_TYPE_METADATA,
  QUERY_METADATA,
  RABBIT_AUTH_GUARD,
  RABBIT_INTERCEPTOR,
  RESOLVER_METADATA,
  RESOLVE_FIELD_METADATA,
  RESOLVE_REFERENCE_METADATA,
  UNION_TYPE_METADATA,
  resolveParams,
} from "@rabbit/internal";
import {
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLSchema,
  GraphQLUnionType,
  isInterfaceType,
  isOutputType,
  isScalarType,
  type GraphQLFieldConfig,
  type GraphQLFieldConfigArgumentMap,
  type GraphQLInputFieldConfig,
  type GraphQLNamedType,
  type GraphQLOutputType,
  type ThunkObjMap,
} from "graphql";
import gql from "graphql-tag";
import merge from "lodash.merge";
import type { ApolloSubGraphOptions, CreateUnionTypeConfig } from "..";
import type { IApolloAdapterOptions } from "../apollo";
import { resolveDirective } from "../utils/resolve-directive";

const isGraphQLDecorator = (type: DecoratorKind) => {
  return type === DecoratorKind.Args;
};

const resolveFieldMetadata = <T = GraphQLFieldConfig<any, any>>(
  target: any
  // metadata: Record<string, any>
): ThunkObjMap<T> => {
  const fields: ThunkObjMap<T> = {};

  const metadata: Record<string, any> =
    Reflect.getMetadata(FIELD_METADATA, target) ?? {};

  for (const entries of Object.entries(metadata)) {
    const [key, { type, defaultValue, nullable }] = entries;
    fields[key] = {
      type: nullable ? type : new GraphQLNonNull(type),
      defaultValue,
      astNode: resolveDirective(target, key),
    } as T;
  }

  return fields;
};

const getResolveFunction = (instance: any, method: string) => {
  const fn = instance[method];

  return async (parent: any, args: any, ctx: IContext, info: any) => {
    const authGaurds = Reflect.getMetadata(AUTH_GUARD_METADATA, fn) ?? [];
    const interceptors = Reflect.getMetadata(INTERCEPTOR_METADATA, fn) ?? [];

    ctx[RABBIT_INTERCEPTOR] = interceptors;
    ctx[RABBIT_AUTH_GUARD] = authGaurds;

    ctx[GRAPHQL] = {
      ...ctx[GRAPHQL],
      args,
      parent,
      info,
    };

    return ctx.application.lifecycle(ctx, () =>
      resolveParams(fn, {}, ctx, instance)
    );
  };
};

const getResolveReferenceFunction = (instance: any, method: string) => {
  const fn = instance[method];

  return async (reference: any, ctx: IContext, info: any) => {
    const authGaurds = Reflect.getMetadata(AUTH_GUARD_METADATA, fn) ?? [];
    const interceptors = Reflect.getMetadata(INTERCEPTOR_METADATA, fn) ?? [];

    ctx[RABBIT_INTERCEPTOR] = interceptors;
    ctx[RABBIT_AUTH_GUARD] = authGaurds;

    ctx[GRAPHQL] = {
      ...ctx[GRAPHQL],
      args: null,
      info,
      reference,
    };

    return ctx.application.lifecycle(ctx, () =>
      resolveParams(fn, {}, ctx, instance)
    );
  };
};

const resolveReturnType = (
  map: Record<string, GraphQLNamedType>,
  type: () =>
    | Constructor
    | [Constructor]
    | GraphQLScalarType
    | [GraphQLScalarType]
) => {
  const Type = type();

  if (Array.isArray(Type)) {
    if (isScalarType(Type[0])) return new GraphQLList(Type[0]);

    const namedType = map[Type[0].name];
    return new GraphQLList(namedType);
  } else {
    if (isScalarType(Type)) return Type;

    const namedType = map[Type.name];
    return namedType;
  }
};

const resolveQuery = (
  resolver: any,
  schema: GraphQLSchema,
  instance: any,
  methodName: string,
  map: Record<any, any>,
  name = "Query"
) => {
  const isQuery = name === "Query";
  const fn = instance[methodName];
  const { returnType, options } = isQuery
    ? Reflect.getMetadata(QUERY_METADATA, fn)
    : Reflect.getMetadata(MUTATION_METADATA, fn);

  const args: GraphQLFieldConfigArgumentMap = {};

  const customMetadata: any[] = Reflect.getMetadata(CUSTOM_METADATA, fn) ?? [];
  const argsMetadata = customMetadata.filter((e) => isGraphQLDecorator(e.type));

  if (argsMetadata.length > 0) {
    for (const metadata of argsMetadata) {
      const {
        name = "",
        options: { type: Type, nullable = false },
      } = metadata;

      let objectType = Type;

      if (Type["prototype"]) {
        const fields = resolveFieldMetadata<GraphQLInputFieldConfig>(Type);

        objectType = new GraphQLInputObjectType({
          fields,
          name: Type.name,
        });
      }

      if (objectType[ENUM]) {
        objectType = map[objectType[ENUM]];
      }

      if (name) {
        args[name] = {
          type: nullable ? objectType : new GraphQLNonNull(objectType),
        };
      } else {
        const fields: Record<string, any> = objectType.getFields();

        for (const [key, { type }] of Object.entries(fields)) {
          args[key] = {
            type,
          };
        }
      }
    }
  }

  return appendObjectFields(schema, name, {
    [methodName]: {
      ...options,
      args,
      type: resolveReturnType(map, returnType) as unknown as GraphQLOutputType,
      resolve: getResolveFunction(instance, methodName),
      astNode: resolveDirective(resolver, methodName) as any,
    },
  });
};

const buildApolloSchema = (apollo: ApolloSubGraphOptions["version"]) => {
  const source = gql`
    directive @key(
      fields: _FieldSet!
      resolvable: Boolean = true
    ) repeatable on OBJECT | INTERFACE

    directive @requires(fields: _FieldSet!) on FIELD_DEFINITION

    directive @provides(fields: _FieldSet!) on FIELD_DEFINITION

    directive @external(reason: String) on OBJECT | FIELD_DEFINITION

    directive @tag(
      name: String!
    ) repeatable on FIELD_DEFINITION | OBJECT | INTERFACE | UNION | ARGUMENT_DEFINITION | SCALAR | ENUM | ENUM_VALUE | INPUT_OBJECT | INPUT_FIELD_DEFINITION

    directive @extends on OBJECT | INTERFACE
    scalar _FieldSet

    scalar _Any
  `;

  return buildSubgraphSchema({
    typeDefs: source,
    resolvers: {},
  });
};

export const buildGraphQLSchema = (options?: ApolloSubGraphOptions) => {
  const { version } = options ?? {};
  const map: Record<any, any> = {};
  const interfacesMap: Record<string, Set<string>> = {};

  let schema = version ? buildApolloSchema(version) : new GraphQLSchema({});

  // Enum
  {
    const enums = Reflect.getMetadata(ENUM_TYPE_METADATA, global) ?? {};
    merge(map, enums);
  }

  {
    const types = Reflect.getMetadata(INTERFACE_TYPE_METADATA, global) ?? [];

    for (const { target, options } of types) {
      const _interface = new GraphQLInterfaceType({
        name: target.name,
        fields: resolveFieldMetadata(target),
        ...options,
        astNode: resolveDirective(target),
      });

      map[target.name] = _interface;
    }
  }

  {
    const objectTypes = Reflect.getMetadata(OBJECT_TYPE_METADATA, global) ?? [];
    for (const { target, options } of objectTypes) {
      const fields = {};
      let interfaces = options?.interfaces?.();
      interfaces = interfaces?.map((e: Constructor) => {
        Object.assign(fields, { ...map[e.name].toConfig().fields });

        if (!interfacesMap[e.name]) {
          interfacesMap[e.name] = new Set();
        }

        interfacesMap[e.name].add(target.name);

        return map[e.name];
      });

      map[target.name] = new GraphQLObjectType({
        name: target.name,
        fields: {
          ...fields,
          ...resolveFieldMetadata(target),
        },
        interfaces,
        astNode: resolveDirective(target),
      });
    }
  }
  schema = addTypes(schema, Object.values(map));

  const resolvedResolvers: Record<string, any> = {};

  // Resolvers
  {
    const resolvers = Reflect.getMetadata(RESOLVER_METADATA, global) ?? [];

    for (const { resolver, parent } of resolvers) {
      const instance = new resolver(...resolveDI(resolver));
      resolvedResolvers[resolver.name] = instance;
      const prototype = Object.getPrototypeOf(instance);

      const methodsNames = Object.getOwnPropertyNames(prototype).filter(
        (item) => !IsConstructor(item) && IsFunction(prototype[item])
      );

      methodsNames.forEach((method) => {
        const kind: DecoratorKind = Reflect.getMetadata(
          DECORATOR_KIND_METADATA,
          instance[method]
        );

        if (kind === DecoratorKind.Query) {
          schema = resolveQuery(
            resolver,
            schema,
            instance,
            method,
            map,
            "Query"
          );
        }

        if (kind === DecoratorKind.Mutation) {
          schema = resolveQuery(
            resolver,
            schema,
            instance,
            method,
            map,
            "Mutation"
          );
        }
      });

      {
        if (parent) {
          const parentType = parent().name;

          const resolveFields =
            Reflect.getMetadata(RESOLVE_FIELD_METADATA, instance) ?? [];

          for (const field of resolveFields) {
            const { key, type, options } = field;

            let returnType = resolveReturnType(map, type);

            const config = map[parentType].toConfig();

            const ObjectType = isInterfaceType(map[parentType])
              ? GraphQLInterfaceType
              : GraphQLObjectType;

            const objectType = new ObjectType({
              ...config,
              fields: {
                ...config.fields,
                [key]: {
                  ...options,
                  type: returnType,
                  resolve: getResolveFunction(instance, key),
                },
              },
            });

            const interfaceNames = new Array(
              ...(interfacesMap[parentType] ?? [])
            );
            const objectTypes: GraphQLNamedType[] = [];
            for (let i = 0; i < interfaceNames.length; i++) {
              const name = interfaceNames[i];
              const origin = map[name];

              map[name] = objectTypes[i] = new GraphQLObjectType({
                ...origin.toConfig(),
                fields: {
                  ...origin.toConfig().fields,
                  [key]: {
                    type: returnType,
                    resolve: getResolveFunction(instance, key),
                  },
                },
              });
            }

            map[parentType] = objectType;
            schema = addTypes(schema, [objectType, ...objectTypes]);
          }
        }
      }
    }
  }

  // Union Type
  {
    const unionTypes: CreateUnionTypeConfig[] =
      Reflect.getMetadata(UNION_TYPE_METADATA, global) ?? [];

    schema = addTypes(
      schema,
      unionTypes.map((e) => {
        return new GraphQLUnionType({
          ...e,
          types: e
            .types()
            .map((type) => (isOutputType(type) ? type : map[type.name])),
        });
      })
    );
  }

  let typeDefs = printSchemaWithDirectives(schema);
  {
    for (const t of options?.orphanedTypes ?? []) {
      typeDefs = typeDefs.replace(`type ${t.name}`, `extend type ${t.name}`);
    }
  }

  const resolvers = getResolversFromSchema(schema);
  {
    delete resolvers._Service;
    delete resolvers._Any;
    delete resolvers._FieldSet;
    // @ts-ignore
    delete resolvers?.Query?._service;
  }

  {
    const metadata = Reflect.getMetadata(RESOLVER_METADATA, global) ?? [];
    for (const { resolver } of metadata) {
      const references =
        Reflect.getMetadata(RESOLVE_REFERENCE_METADATA, resolver) ?? [];

      for (const reference of references) {
        const instance = resolvedResolvers[resolver.name];

        merge(resolvers, {
          [reference.type().name]: {
            __resolveReference: getResolveReferenceFunction(
              instance,
              reference.key
            ),
          },
        });
      }
    }
  }

  return version
    ? buildSubgraphSchema({
        typeDefs: gql`
          ${typeDefs}
        `,
        resolvers: resolvers as unknown as any,
      })
    : schema;
};
