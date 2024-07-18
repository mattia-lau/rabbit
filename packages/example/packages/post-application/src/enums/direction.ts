import { createEnumType } from "@rabbit/graphql";

export enum Direction {
  Up = "UP",
  Down = "DOWN",
}

createEnumType(Direction, {
  name: "Direction",
});
