import { Field, InputType } from "@rabbit/graphql";
import { GraphQLString } from "graphql";

@InputType()
export class LoginInput {
  @Field(() => GraphQLString)
  username!: string;

  @Field(() => GraphQLString)
  password!: string;
}
