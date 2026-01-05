import type { Context } from "hono";
import type { Variables } from "../types/types.js";
import jwt from "jsonwebtoken";
import { pool } from "../database/db.js";

export async function authMiddleware(
  c: Context<{ Variables: Variables }>,
  next: () => Promise<void>,
) {
  let auth = c.req.header("Authorization");
  auth = auth?.replace("Bearer ", "");
  const incomingId =
    c.req.header("x-request-id") || c.req.header("x-correlation-id");

  if (!auth)
    return c.json(
      // Token not present
      {
        success: false,
        error: {
          httpStatus: 401,
          code: "AUTH_UNAUTHORIZED",
          message: "Unauthorized",
          requestId: incomingId,
          details: {},
        },
      },
      401,
    );

  const token = auth.replace("Bearer ", "").trim();
  const payload:any = jwt.verify(token, process.env.JWT_SECRET!);

  const res = await pool.query(
    "SELECT 1 FROM sessions WHERE id=$1 AND expires_at > now()",
    [payload.sessionId],
  );

  const role = await pool.query("SELECT role FROM users WHERE id=$1", [
    payload.userId,
  ]);

  if (res.rowCount === 0)
    return c.json(
      //token expired
      {
        success: false,
        error: {
          httpStatus: 401,
          code: "AUTH_TOKEN_EXPIRED",
          message: "Session Expired",
          requestId: incomingId,
          details: {},
        },
      },
      401,
    );

  c.set("userId", payload.userId);
  c.set("userRole", role.rows[0].role);

  await next();
}
