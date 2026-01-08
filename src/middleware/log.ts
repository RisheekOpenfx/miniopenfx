import type { MiddlewareHandler } from "hono";

export const loggerMiddleware: MiddlewareHandler = async (c, next) => {
  const start = Date.now();

  const requestId = c.req.header("cf-ray") ?? crypto.randomUUID();

  try {
    await next();
  } catch (err) {
    console.error(
      JSON.stringify({
        level: "error",
        requestId,
        method: c.req.method,
        path: c.req.path,
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      }),
    );
    throw err;
  } finally {
    const durationMs = Date.now() - start;

    console.log(
      JSON.stringify({
        level: "info",
        requestId,
        method: c.req.method,
        path: c.req.path,
        status: c.res.status,
        durationMs,
        userId: c.get("userId"),
        cf: {
          colo: c.req.raw.cf?.colo,
          country: c.req.raw.cf?.country,
        },
      }),
    );
  }
};
