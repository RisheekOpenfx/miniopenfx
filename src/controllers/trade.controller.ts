import { Context } from "hono";
import { trade } from "../services/trade.service.js";
import { success } from "../utilities/response.js";
import { DbLike } from "../types/types.js";
import { createDb } from "../database/client.js";
import { getUserByEmail } from "../models/users.model.js";
import { ErrorCode } from "../errors/error_codes.js";

export async function selfTradeController(c: Context) {
  const db: DbLike = createDb(c.env.DATABASE_URL);
  const userId = c.get("userId");
  const idempotencyKey = c.req.header("Idempotency-Key");
  const { quoteId, amount } = await c.req.json();
  console.log(quoteId, amount)

  await trade(db, userId, userId, idempotencyKey, quoteId, amount);

  return success(c, "Executed", 201);
}

export async function otherTradeController(c: Context) {
  const userId = c.get("userId");
  const db: DbLike = createDb(c.env.DATABASE_URL);
  const idempotencyKey = c.req.header("Idempotency-Key");
  const { quoteId, amount, reciverEmail } = await c.req.json();
  const receiver = await getUserByEmail(db, reciverEmail);
  if (receiver?.id === undefined) {
    throw new Error(ErrorCode.USER_DOESNT_EXIST);
  }
  const receiverId = receiver.id;

  await trade(db, userId, receiverId, idempotencyKey, quoteId, amount);

  return success(c, "Executed", 201);
}
