export interface IApplication<T extends Record<string, any>> {
  init: () => void;
  emitAsync: (event: string, ctx: T) => Promise<any[]>;
  emitInternal: (event: string, ctx: T) => Promise<any[]>;
  on: (event: string, listener: any) => void;
  setRef: (path: string, ref: any) => void;
}
