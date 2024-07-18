import { Directive, Field, ObjectType } from "@rabbit/graphql";
import { GraphQLString } from "graphql";

@ObjectType()
@Directive('@key(fields: "id")')
export class User {
  @Field(() => GraphQLString)
  id!: string;

  @Field(() => GraphQLString)
  name!: string;
}
