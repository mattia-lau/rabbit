import { MapperKind, mapSchema } from "@graphql-tools/utils";
import { DIRECTIVE_METADATA } from "@rabbit/internal";
import { GraphQLObjectType, Kind, parse, type GraphQLSchema } from "graphql";

export const buildApolloGraph = (schema: GraphQLSchema) => {
  {
    const directives = Reflect.getMetadata(DIRECTIVE_METADATA, global) ?? [];
    for (const directive of directives) {
      schema = mapSchema(schema, {
        [MapperKind.OBJECT_TYPE]: (type) => {
          if (type.name === directive.target.name) {
            const ast = parse(`type String ${directive.sdl}`);
            // @ts-ignore
            const { name, arguments: args } = ast.definitions[0].directives[0];

            return new GraphQLObjectType({
              ...type.toConfig(),
              // @ts-ignore
              astNode: {
                ...type.astNode,
                directives: [
                  ...(type.astNode?.directives ?? []),
                  {
                    kind: Kind.DIRECTIVE,
                    name,
                    arguments: args,
                  },
                ],
              },
            });
          }

          return type;
        },
      });
    }
  }

  // console.log(printSchemaWithDirectives(schema));

  return schema;
};
