import { Body, Context, Controller, Delete, Get } from "@rabbit/core";
import { describe, expect, it } from "bun:test";
import {
  BODY_METADATA,
  CONTEXT_METADATA,
  CONTROLLER_METADATA,
  METHOD_METADATA,
  PATH_METADATA,
} from "../../src/utils/symbols";

@Controller("/")
class TestController {
  @Get("/")
  fn(@Context() ctx: any) {}
  
  @Delete("/")
  remove(@Body() body: any) {}
}

describe("HTTP Decorator", () => {
  const testController = new TestController();

  it("should enrich metatype with Controller metadata", () => {
    const context = Reflect.getMetadata(CONTROLLER_METADATA, global);
    expect(context).toEqual([TestController]);
  });

  it("should enrich metatype with Context metadata", () => {
    const context = Reflect.getMetadata(CONTEXT_METADATA, testController.fn);
    expect(context).toEqual({ index: 0 });
  });

  it("should enrich metatype with GET metadata", () => {
    const method = Reflect.getMetadata(METHOD_METADATA, testController.fn);
    const path = Reflect.getMetadata(PATH_METADATA, testController.fn);
    expect(method).toBe("GET");
    expect(path).toBe("/");
  });

  it("should enrich metatype with DELETE and BODY metadata", () => {
    const method = Reflect.getMetadata(METHOD_METADATA, testController.remove);
    const path = Reflect.getMetadata(PATH_METADATA, testController.remove);
    const body = Reflect.getMetadata(BODY_METADATA, testController.remove);
    expect(method).toBe("DELETE");
    expect(path).toBe("/");
    expect(body).toEqual({ index: 0, key: "remove" });
  });
});
