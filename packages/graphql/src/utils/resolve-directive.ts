import { DIRECTIVE_METADATA } from "@rabbit/internal";
import { Kind, parse, type ObjectTypeDefinitionNode } from "graphql";

export const resolveDirective = (
  target: any,
  key?: string
): ObjectTypeDefinitionNode => {
  const metadata = Reflect.getMetadata(DIRECTIVE_METADATA, target) ?? [];

  const directives = [];

  for (const directive of metadata) {
    if (directive.key !== key) continue;

    const ast = parse(`type String ${directive.sdl}`);
    // @ts-ignore
    const { name, arguments: args } = ast.definitions[0].directives[0];

    directives.push({
      kind: Kind.DIRECTIVE,
      name,
      arguments: args,
    });
  }

  return {
    directives,
  } as unknown as any;
};
