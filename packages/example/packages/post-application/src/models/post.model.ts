import { Field, ObjectType } from "@rabbit/graphql";
import { GraphQLID } from "graphql";

@ObjectType()
export class Post {
  @Field(() => GraphQLID)
  id!: number;
}
