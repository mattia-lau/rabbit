import { DEPENDENCY_INJECTION_METADATA } from "@rabbit/internal";
import { getContainer } from "./container";

export const resolveDI = (Instance: any) => {
  const di: any[] =
    Reflect.getMetadata(DEPENDENCY_INJECTION_METADATA, Instance) ?? [];

  const constructorValues: any[] = new Array(di.length);
  di.forEach(({ index, symbol }) => {
    const service = getContainer().resolve(symbol);

    constructorValues[index] = service;
  });

  return constructorValues;
};
