import "../models/human.type";
import "../models/person.type";

import { faker } from "@faker-js/faker";
import { Headers, Inject, UseAuthGuard, UseInterceptor } from "@rabbit/core";
import {
  Args,
  Directive,
  Mutation,
  Parent,
  Query,
  ResolveField,
  ResolveReference,
  Resolver,
} from "@rabbit/graphql";
import { GraphQLString } from "graphql";
import { User } from "../../decorators/user.decorator";
import { AuthGuard } from "../../guards/auth.guard";
import { JwtMiddleware } from "../../middlewares/jwt.middleware";
import { LoggingMiddleware } from "../../middlewares/logging.middleware";
import { PersonService } from "../../services/person.service";
import { UpvotePostInput } from "../inputs/upvote-post.input";
import { Character } from "../models/character.interface";

@Resolver(() => Character)
export class PersonResolver {
  constructor(
    @Inject(PersonService) private readonly personService: PersonService
  ) {}

  @Query(() => Character)
  @UseInterceptor(LoggingMiddleware, JwtMiddleware)
  @UseAuthGuard(AuthGuard)
  hello(
    @Headers("host") host: string,
    @User() user: any,
    @Parent() parent: any
  ) {
    return { id: "1", name: faker.person.fullName() };
  }

  @ResolveField(() => [Character])
  friends() {
    return [{ id: "2" }];
  }

  @ResolveField(() => GraphQLString)
  background(@Parent() parent: any) {
    return faker.person.bio();
  }

  @Mutation(() => Character)
  @Directive(
    `@deprecated(reason: "This query will be removed in the next version")`
  )
  join() {
    return { id: "1", name: "Hello" };
  }

  @Mutation(() => Character)
  async upvotePost(
    @Args("input", { type: () => UpvotePostInput })
    input: UpvotePostInput
  ) {
    return { id: "1" };
  }

  @ResolveReference(() => Character)
  resolveReference(reference: { __typename: string; id: number }) {
    return { id: "3" };
  }
}
