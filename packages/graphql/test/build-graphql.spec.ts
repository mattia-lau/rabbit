import { GraphQLInt, GraphQLString, graphql, printSchema } from "graphql";
import { ObjectType, buildGraphQLSchema } from "../src";
import { describe, it, expect } from "bun:test";
import { Resolver } from "../src/decorators/resolver";
import { Query } from "../src/decorators";
import { Field } from "../src/decorators/field";
import { Inject, register } from "@rabbit/core";

@ObjectType()
export class Person {
  @Field(() => GraphQLInt)
  age!: number;

  @Field(() => GraphQLString)
  name!: string;
}

class PersonService {
  get() {
    return { age: 1 };
  }
}

register(PersonService, (ctx) => new PersonService());

@Resolver()
export class PersonResolver {
  constructor(
    @Inject(PersonService) private readonly personService: PersonService
  ) {}

  @Query(() => Person)
  hello() {
    return this.personService.get();
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
