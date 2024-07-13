import type { Constructor, IContext, IInterceptor } from "@rabbit/common";
import { match } from "path-to-regexp";
import { resolveDI } from "..";
import { Context } from "../decorators/context.decorator";
import { NotFoundError } from "../errors/not-found.error";
import "../polyfills/promise";
import type { IAuthGuard } from "../types/auth-guard";
import {
  BODY_METADATA,
  CONTEXT_METADATA,
  HEADERS_METADATA,
  HEADER_METADATA,
  INTERCEPTOR_METADATA,
  PARAMS_METADATA,
} from "../utils/symbols";

type Listener = (...event: unknown[]) => unknown | Promise<unknown>;

const GLOBAL_PRE_INTERCEPTOR_EVENT = "rabbit__global_pre_interceptor";
const GLOBAL_POST_INTERCEPTOR_EVENT = "rabbit__global_post_interceptor";
const PRE_INTERCEPTOR_EVENT = "rabbit__pre_interceptor";
const POST_INTERCEPTOR_EVENT = "rabbit__post_interceptor";
const AUTH_GUARD_EVENT = "rabbit__auth_guard";
const AUTH_GUARD_FAILED_EVENT = "rabbit__auth_guard_failed";

export class RabbitEventEmitter {
  private events: Record<string, Listener[]> = {};
  private guards: Record<string, IAuthGuard[]> = {};
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

  setGuards(key: string, val: IAuthGuard[]) {
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

  private async emitInternal(event: string, ctx: IContext) {
    const [listener] = this.events[event];

    return this.resolveParams(listener, event, {}, ctx);
  }

  private async resolveParams(
    listener: any,
    key: string,
    pathMatch: any,
    ctx: IContext
  ) {
    const data = new Array(listener.length);

    const metadata = (Reflect.getMetadata(HEADERS_METADATA, listener) ||
      []) as { index: number; key: string }[];
    const { headers } = ctx.req;

    metadata.forEach(({ index, key }) => {
      data[index] = headers.get(key.toLowerCase());
    });

    const resHeaders = Reflect.getMetadata(HEADER_METADATA, listener) ?? [];
    Object.entries(resHeaders).forEach(([key, val]) => {
      ctx.res.headers.set(key, val as string);
    });

    const params = (Reflect.getMetadata(PARAMS_METADATA, listener) || []) as {
      index: number;
      key: string;
    }[];

    params.forEach(({ index, key }) => {
      data[index] = pathMatch.params![key];
    });

    {
      const context = Reflect.getMetadata(CONTEXT_METADATA, listener);
      if (context) {
        data[context.index] = ctx;
      }
    }

    {
      const body = Reflect.getMetadata(BODY_METADATA, listener);
      if (body) {
        const bodyParser = async () => {
          const contentType = ctx.req.headers.get("content-type");
          if (contentType === "application/json") {
            return ctx.req.json();
          }

          if (contentType === "application/graphql") {
            return { query: await ctx.req.text() };
          }

          if (contentType === "application/x-www-form-urlencoded") {
            return {};
          }

          if (contentType?.startsWith("multipart/form-data")) {
            return ctx.req.formData();
          }

          return ctx.req.text();
        };

        data[body.index] = await bodyParser();
      }
    }

    const instance = this.refs[key] ?? this;
    const fn = listener.bind(instance);

    const body = await fn(...data);

    return body;
  }

  private async handleAuthGuard(@Context() ctx: IContext) {
    const guards = this.guards[ctx.event] ?? [];

    if (guards.length > 0) {
      const res = await Promise.all(
        guards.map((guard) => guard.canActive(ctx))
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
    return new Response(JSON.stringify({ message: "Authorized" }), {
      headers: {
        "Content-Type": "application/json",
      },
      status: 403,
    });
  }

  private async handlePreGlobalInterceptor(@Context() ctx: IContext) {
    await Promise.chain(
      (ctx.interceptors ?? []).map((interceptor: IInterceptor) =>
        interceptor.pre(ctx)
      )
    );
  }

  private async handlePostGlobalInterceptor(@Context() ctx: IContext) {
    await Promise.chain(
      (ctx.interceptors ?? []).map((interceptor: IInterceptor) =>
        interceptor.post(ctx)
      )
    );
  }

  private async handlePreInterceptor(@Context() ctx: IContext) {
    const [listener] = this.events[ctx.event];
    const interceptors: Constructor<IInterceptor>[] =
      Reflect.getMetadata(INTERCEPTOR_METADATA, listener) ?? [];

    ctx._interceptors = interceptors.map((Interceptor) => {
      return new Interceptor(...resolveDI(Interceptor));
    });

    await Promise.chain(
      ctx._interceptors.map((interceptor: IInterceptor) => interceptor.pre(ctx))
    );
  }

  private async handlePostInterceptor(@Context() ctx: IContext) {
    await Promise.chain(
      ctx._interceptors.map((interceptor: IInterceptor) =>
        interceptor.post(ctx)
      )
    );
  }

  async emitAsync(event: string, ctx: IContext): Promise<any[]> {
    const promises: PromiseLike<any>[] = [];

    for (const key of Object.keys(this.events)) {
      const fn = match(key, { decode: decodeURIComponent });
      const pathMatch = fn(event as string);
      if (pathMatch) {
        ctx.event = key;
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

        promises.push(
          ...(this.events[key] ?? []).map((listener) => {
            return this.resolveParams(listener, key, pathMatch, ctx);
          })
        );
      }
    }

    if (promises.length === 0) {
      throw new NotFoundError();
    }

    const res = await Promise.all(promises);
    ctx.res.body = res;

    await this.emitInternal(POST_INTERCEPTOR_EVENT, ctx);
    await this.emitInternal(GLOBAL_POST_INTERCEPTOR_EVENT, ctx);

    return ctx.res.body;
  }
}
