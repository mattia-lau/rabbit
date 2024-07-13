export interface IApplication<T extends Record<string, any>> {
  init: () => void;
  emitAsync: (event: string, ctx: T) => Promise<any[]>;
}
