import {
  Query,
  ResolveField,
  ResolveReference,
  Resolver,
} from "@rabbit/graphql";
import { User } from "./models/user";
import { GraphQLString } from "graphql";
import { Reference } from "@rabbit/graphql/src/decorators/reference";

@Resolver(() => User)
export class UserResolver {
  @Query(() => GraphQLString, { description: "Hello my friend" })
  hello() {
    return "";
  }

  @ResolveReference(() => User)
  resolveReference(
    @Reference() reference: { __typename: string; id: number }
  ): User {
    return { id: reference.id, name: "ZZZ" };
  }

  @ResolveField(() => GraphQLString)
  background() {
    return "Hello World";
  }
}
