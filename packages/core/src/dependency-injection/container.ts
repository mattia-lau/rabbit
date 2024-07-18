import { type Constructor } from "@rabbit/common";
import "reflect-metadata";

class Container {
  private registrations: Map<any, (context: Container) => any> = new Map();

  register(
    token: Constructor,
    factory: (context: Container) => Container
  ): void {
    this.registrations.set(token.name, factory);
  }

  resolve<T>(token: Constructor<T>): T {
    const factory = this.registrations.get(token.name);
    if (!factory) {
      throw new Error(`No registration found for ${token.name}`);
    }

    return factory(this);
  }
}

let containerInstance: Container | null = null;

export const getContainer = (): Container => {
  if (!containerInstance) {
    containerInstance = new Container();
  }
  return containerInstance;
};

export const register = (
  token: Constructor,
  factory: (context: Container) => any
): void => {
  return getContainer().register(token, factory);
};

export const resolve = (token: Constructor) => {
  return getContainer().resolve(token);
};
