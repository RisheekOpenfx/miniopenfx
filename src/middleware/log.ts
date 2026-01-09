import pino from "pino";
import type { MiddlewareHandler } from "hono";

const baseLogger = pino({
  level: "info",
});

export const loggerMiddleware: MiddlewareHandler = async (c, next) => {
  const requestId = c.var.requestId;
  const start = Date.now();

  const log = baseLogger.child({
    requestId,
    method: c.req.method,
    path: new URL(c.req.url).pathname,
  });

  c.set("logger", log);

  try {
    await next();
  } finally {
    const ms = Date.now() - start;
    const status = c.res?.status;

    log.info({ status, ms }, "request completed");
  }
};
