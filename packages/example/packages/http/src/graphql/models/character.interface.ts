import { Directive, Field, InterfaceType } from "@rabbit/graphql";
import { GraphQLInt } from "graphql";

@InterfaceType({
  resolveType: (val: any) => {
    if ("name" in val) {
      return "Human";
    }

    return "Person";
  },
})
@Directive('@key(fields: "id")')
export abstract class Character {
  @Field(() => GraphQLInt)
  id!: string;
}
