import { describe, it, expect } from "bun:test";
import "../../src/polyfills/promise";

describe("Promise Polyfill", () => {
  const context = { number: 0 };
  const sum = async (ctx: typeof context) => {
    ctx.number += 1;
  };

  it("Promise should run one by one", async () => {
    await Promise.chain([sum(context), sum(context)]);
    expect(context.number).toBe(2);
  });
});
