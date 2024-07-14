import { GraphQLInt, GraphQLString, graphql, printSchema } from "graphql";
import { ObjectType, buildGraphQLSchema } from "../src";
import { describe, it, expect } from "bun:test";
import { Resolver } from "../src/decorators/resolver";
import { Query } from "../src/decorators";
import { Field } from "../src/decorators/field";

@ObjectType()
export class Person {
  @Field(() => GraphQLInt)
  age!: number;

  @Field(() => GraphQLString)
  name!: string;
}

@Resolver()
export class PersonResolver {
  @Query(() => Person)
  hello() {
    return { age: 1 };
  }
}

describe("Build GraphQL Schema", () => {
  const schema = buildGraphQLSchema();

  it("Should return age", async () => {
    const result = await graphql({ schema, source: "{ hello { age }  }" });

    const hello = result.data!.hello as any;
    expect(hello.age).toBe(1);
  });
});
