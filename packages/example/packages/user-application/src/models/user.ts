import { Directive, Field, ObjectType } from "@rabbit/graphql";
import { GraphQLID, GraphQLString } from "graphql";

@ObjectType()
@Directive('@key(fields: "id")')
export class User {
  @Field(() => GraphQLID)
  id!: number;

  @Field(() => GraphQLString)
  name!: string;
}
