import { Directive, Field, ObjectType } from "@rabbit/graphql";
import { GraphQLInt } from "graphql";
import { Character } from "./character.interface";

@ObjectType({
  interfaces: () => [Character],
})
@Directive('@key(fields: "id")')
@Directive('@extends')
export class Person implements Character {
  id!: string;

  @Field(() => GraphQLInt)
  @Directive('@external')
  @Directive(`@deprecated(reason: "This query will be removed in the next version")`)
  age!: number;
}
