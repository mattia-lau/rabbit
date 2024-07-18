import { Field, InputType } from "@rabbit/graphql";
import { GraphQLInt } from "graphql";

@InputType()
export class UpvotePostInput {
  @Field(() => GraphQLInt)
  postId!: number;
}
