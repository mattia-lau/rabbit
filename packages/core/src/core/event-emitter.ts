import "../polyfills/promise";

import type {
  Constructor,
  IAuthGuard,
  IContext,
  IInterceptor,
} from "@rabbit/common";
import {
  AUTH_GUARD_METADATA,
  INTERCEPTOR_HANDLER,
  INTERCEPTOR_METADATA,
  RABBIT_AUTH_GUARD,
  RABBIT_GLOBA_INTERCEPTOR,
  RABBIT_INTERCEPTOR,
  resolveParams,
} from "@rabbit/internal";
import { match } from "path-to-regexp";
import { HttpExeception, resolveDI } from "..";
import { Context } from "../decorators/context.decorator";
import { NotFoundError } from "../errors/not-found.error";

type Listener = (...event: unknown[]) => unknown | Promise<unknown>;

const GLOBAL_PRE_INTERCEPTOR_EVENT = "rabbit__global_pre_interceptor";
const GLOBAL_POST_INTERCEPTOR_EVENT = "rabbit__global_post_interceptor";
const PRE_INTERCEPTOR_EVENT = "rabbit__pre_interceptor";
const POST_INTERCEPTOR_EVENT = "rabbit__post_interceptor";
const AUTH_GUARD_EVENT = "rabbit__auth_guard";
const AUTH_GUARD_FAILED_EVENT = "rabbit__auth_guard_failed";

export class RabbitEventEmitter {
  private events: Record<string, Listener[]> = {};
  private guards: Record<string, Constructor<IAuthGuard>[]> = {};
  private refs: Record<string, Constructor> = {};

  constructor() {
    this.events[AUTH_GUARD_FAILED_EVENT] = [this.handleAuthGuardFail as any];
    this.events[AUTH_GUARD_EVENT] = [this.handleAuthGuard as any];

    this.events[GLOBAL_PRE_INTERCEPTOR_EVENT] = [
      this.handlePreGlobalInterceptor as any,
    ];
    this.events[GLOBAL_POST_INTERCEPTOR_EVENT] = [
      this.handlePostGlobalInterceptor as any,
    ];

    this.events[PRE_INTERCEPTOR_EVENT] = [this.handlePreInterceptor as any];
    this.events[POST_INTERCEPTOR_EVENT] = [this.handlePostInterceptor as any];
  }

  setRef(path: string, ref: Constructor) {
    this.refs[path] = ref;
  }

  setGuards(key: string, val: Constructor<IAuthGuard>[]) {
    if (!this.guards[key]) {
      this.guards[key] = [];
    }
    this.guards[key]!.push(...val);
  }

  on(event: string, listener: Listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event]!.push(listener);
  }

  off(event: string, listener: Listener) {
    if (this.events[event]) {
      this.events[event] = this.events[event]!.filter((l) => l !== listener);
    }
  }

  once(event: string, listener: Listener) {
    const remove = (eventData: any) => {
      this.off(event, remove);
      listener(eventData);
    };
    this.on(event, remove);
  }

  emit(event: string, eventData: any) {
    if (this.events[event]) {
      this.events[event]!.forEach((listener) => listener(eventData));
    }
  }

  async emitInternal(event: string, ctx: IContext) {
    const [listener] = this.events[event];

    return resolveParams(listener, {}, ctx, this.refs[event] ?? this);
  }

  private async handleAuthGuard(@Context() ctx: IContext) {
    const guards = [
      ...(this.guards[ctx.event] ?? []),
      ...(ctx[RABBIT_AUTH_GUARD] ?? []),
    ];

    if (guards.length > 0) {
      const res = await Promise.all(
        guards.map((guard) => new guard(...resolveDI(guard)).canActive(ctx))
      );

      if (res.some((val) => val == false)) {
        return this.emitInternal(AUTH_GUARD_FAILED_EVENT, {
          ...ctx,
          guards,
        });
      }

      return true;
    }

    return true;
  }

  private async handleAuthGuardFail(@Context() ctx: IContext) {
    throw new HttpExeception("Unauthorized", 403);
    // ctx.res.body = "Authorized";
    // ctx.res.status = 403;
    // return new Response(JSON.stringify({ message: "Authorized" }), {
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   status: 403,
    // });
  }

  private async handlePreGlobalInterceptor(@Context() ctx: IContext) {
    await Promise.chain(
      (ctx[RABBIT_GLOBA_INTERCEPTOR] ?? []).map((interceptor: IInterceptor) =>
        interceptor.pre(ctx)
      )
    );
  }

  private async handlePostGlobalInterceptor(@Context() ctx: IContext) {
    await Promise.chain(
      (ctx[RABBIT_GLOBA_INTERCEPTOR] ?? []).map((interceptor: IInterceptor) =>
        interceptor.post(ctx)
      )
    );
  }

  private async handlePreInterceptor(@Context() ctx: IContext) {
    const [listener] = this.events[ctx.event];
    const interceptors: Constructor<IInterceptor>[] =
      Reflect.getMetadata(INTERCEPTOR_METADATA, listener) ??
      ctx[RABBIT_INTERCEPTOR] ??
      [];

    ctx._interceptors = interceptors.map((Interceptor) => {
      return new Interceptor(...resolveDI(Interceptor));
    });

    await Promise.chain(
      ctx._interceptors.map((interceptor: IInterceptor) => interceptor.pre(ctx))
    );
  }

  private async handlePostInterceptor(@Context() ctx: IContext) {
    await Promise.chain(
      (ctx._interceptors ?? []).map((interceptor: IInterceptor) =>
        interceptor.post(ctx)
      )
    );
  }

  async lifecycle(ctx: IContext, fn: Function) {
    {
      await this.emitInternal(GLOBAL_PRE_INTERCEPTOR_EVENT, ctx);
    }

    {
      await this.emitInternal(PRE_INTERCEPTOR_EVENT, ctx);
    }

    {
      const res = await this.emitInternal(AUTH_GUARD_EVENT, ctx);

      if (typeof res !== "boolean") {
        return [res];
      }
    }

    const res = await fn();

    await this.emitInternal(POST_INTERCEPTOR_EVENT, ctx);
    await this.emitInternal(GLOBAL_POST_INTERCEPTOR_EVENT, ctx);

    return res;
  }

  async emitAsync(event: string, ctx: IContext): Promise<any[]> {
    const promises: PromiseLike<any>[] = [];

    {
      await this.emitInternal(GLOBAL_PRE_INTERCEPTOR_EVENT, ctx);
    }

    for (const key of Object.keys(this.events)) {
      const fn = match(key, { decode: decodeURIComponent });
      const pathMatch = fn(event as string);
      if (pathMatch) {
        ctx.event = key;
        ctx.req.params = pathMatch.params;

        {
          await this.emitInternal(PRE_INTERCEPTOR_EVENT, ctx);
        }

        {
          const res = await this.emitInternal(AUTH_GUARD_EVENT, ctx);

          if (typeof res !== "boolean") {
            return [res];
          }
        }

        promises.push(
          ...(this.events[key] ?? []).map((listener) => {
            return resolveParams(
              listener,
              pathMatch,
              ctx,
              this.refs[event] ?? this
            );
          })
        );
      }
    }

    const res = await Promise.all(promises);

    await this.emitInternal(POST_INTERCEPTOR_EVENT, ctx);
    await this.emitInternal(GLOBAL_POST_INTERCEPTOR_EVENT, ctx);

    if (res.length === 0) {
      throw new NotFoundError();
    }

    return res;
  }
}
