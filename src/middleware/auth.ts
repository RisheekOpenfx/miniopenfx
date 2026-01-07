import type { Context } from "hono";
import type { DbLike, Variables } from "../types/types.js";
import jwt from "jsonwebtoken";
import { ErrorCode } from "../errors/error_codes.js";
import { getUserById } from "../models/users.model.js";
import { getSessionById } from "../models/sessions.model.js";
import { publicRoutes } from "../utilities/publicRoutes.js";
import { createDb } from "../database/client.js";
import { EnvBindings } from "../types/env.js";

export async function authMiddleware(
  c: Context<{ Variables: Variables; Bindings: EnvBindings }>,
  next: () => Promise<void>,
) {
  const auth = c.req.header("Authorization");
  const path = c.req.path;
  if (publicRoutes.includes(path)) {
    return next();
  }

  if (!auth) throw new Error(ErrorCode.UNAUTHORIZED);
  const db: DbLike = createDb(c.env.DATABASE_URL);
  const token = auth.replace("Bearer ", "").trim();
  const payload: string | jwt.JwtPayload = jwt.verify(
    token,
    process.env.JWT_SECRET!,
  );
  if (typeof payload === "string") {
    throw new Error(ErrorCode.JWT_RETURNED_STRING);
  }

  const res = await getSessionById(db, payload.sessionId);

  const role = await getUserById(db, payload.userId);

  if (res === undefined) throw new Error(ErrorCode.AUTH_TOKEN_EXPIRED);

  c.set("userId", payload.userId);
  if (role === null) {
    throw new Error(ErrorCode.UNAUTHORIZED);
  }
  c.set("userRole", role.role);

  await next();
}
