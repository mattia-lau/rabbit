import { Query, ResolveField, Resolver } from "@rabbit/graphql";
import { GraphQLID } from "graphql";
import { User } from "../models/user.model";

@Resolver(() => User)
export class UserResolver {
  @Query(() => [User])
  me(): User[] {
    return [{ id: 1, username: "test" }];
  }

  @ResolveField(() => [GraphQLID])
  posts() {
    return [1, 2, 3];
  }
}
