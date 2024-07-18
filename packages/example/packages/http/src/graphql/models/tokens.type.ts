import { Field, ObjectType } from "@rabbit/graphql";
import { GraphQLString } from "graphql";

@ObjectType()
export class Tokens {
  @Field(() => GraphQLString)
  accessToken!: string;
}
