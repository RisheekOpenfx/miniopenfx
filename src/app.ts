import { Hono } from "hono";
import { Context } from "hono";
import { Variables } from "./types/types";
import { authMiddleware } from "./middleware/auth";
import { ErrorCode } from "./errors/error_codes";
import { ERROR_RESPONSE_MAP } from "./errors/response";
import { EnvBindings } from "./types/env";
import { loggerMiddleware } from "./middleware/log";

export function createApp(){
    const app = new Hono<{ Variables: Variables, Bindings: EnvBindings}>();
    app.use("*", authMiddleware);
    app.use("*", loggerMiddleware);
    app.onError((err, c: Context<{Variables: Variables, Bindings: EnvBindings}>) => {
if (err instanceof Error && err.message in ERROR_RESPONSE_MAP) {
  const errorCode = err.message as ErrorCode;
  const { status, body } = ERROR_RESPONSE_MAP[errorCode];

  return c.json(body, status);
}

return c.json({success:false, Error: "Internal Server Error"}, 500)
    });

    app.notFound((c)=> c.json({success:false, "Message": "Route Not Found"}, 404),
);

return app;
}