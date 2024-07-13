declare module globalThis {
  interface PromiseConstructor {
    chain: <T>(promises: any[]) => Promise<T[]>;
  }
}
