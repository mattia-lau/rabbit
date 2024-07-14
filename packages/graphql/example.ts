import {
  Inject,
  createApplication,
  register,
  type IAuthGuard,
  UseAuthGuard,
} from "@rabbit/core";
import { GraphQLInt, GraphQLString } from "graphql";
import { ObjectType, Query, Resolver } from "./src/decorators";
import { Field } from "./src/decorators/field";
import { GraphQLAdapter } from "./src/server";
import { NodeAdapter } from "@rabbit/node-adapter";
import type { IContext } from "@rabbit/common";

@ObjectType()
export class Person {
  @Field(() => GraphQLInt)
  age!: number;

  @Field(() => GraphQLString)
  name!: string;
}

class PersonService {
  get() {
    return { age: 1 };
  }
}

register(PersonService, (ctx) => new PersonService());

let i = 0;
class AuthGuard implements IAuthGuard {
  canActive(ctx: IContext): boolean | Promise<boolean> {
    return i++ % 2 === 0;
  }
}

@Resolver()
export class PersonResolver {
  constructor(
    @Inject(PersonService) private readonly personService: PersonService
  ) {}

  @Query(() => Person)
  @UseAuthGuard(AuthGuard)
  hello() {
    return this.personService.get();
  }

  @Query(() => Person)
  @UseAuthGuard(AuthGuard)
  test() {
    return this.personService.get();
  }
}

createApplication({
  adapter: new GraphQLAdapter(NodeAdapter),
  compress: true,
  responseHandler: async (event, res) => {
    return res;
  },
});
