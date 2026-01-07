import { Context } from "hono";
import { devAddMoneyService } from "../services/dev.service";
import { success } from "../utilities/response";
import { DbLike } from "../types/types";
import { createDb } from "../database/client";

export async function devAddMoneyController(c: Context) {
  const userId = c.get("userId");
  const db: DbLike = createDb(c.env.DATABASE_URL);

  const { currency, amount, reciverId } = await c.req.json();
  await devAddMoneyService(db, reciverId, currency, amount, userId);
  return success(c, "Credited!", 201);
}
