import { Context } from "hono";
import { trade } from "../services/trade.service.js";
import { TradeResult } from "../types/trades.js";
import { pool } from "../database/db.js";

export async function selfTradeController(c: Context) {
  const userId = c.get("userId");
  const idempotencyKey = c.req.header("Idempotency-Key");
  const { quoteId, amount } = await c.req.json();

  const result = await trade(userId, userId, idempotencyKey, quoteId, amount);

  return handleTradeResult(c, result, idempotencyKey);
}

export async function otherTradeController(c: Context) {
  const userId = c.get("userId");
  const idempotencyKey = c.req.header("Idempotency-Key");
  const { quoteId, amount, receiverId } = await c.req.json();

  const result = await trade(
    userId,
    receiverId,
    idempotencyKey,
    quoteId,
    amount,
  );

  return handleTradeResult(c, result, idempotencyKey);
}

async function handleTradeResult(
  c: Context,
  result: TradeResult,
  idempotencyKey?: string,
) {
  switch (result) {
    case TradeResult.DUPLICATED: {
      const dup = await pool.query(
        "SELECT * FROM trades WHERE idempotency_key=$1",
        [idempotencyKey],
      );
      return c.json(dup.rows[0], 409);
    }

    case TradeResult.REJECTED:
      return c.json(
        {
          success: false,
          error: {
            code: "INSUFFICIENT_BALANCE",
            message: "Insufficient balance",
          },
        },
        401,
      );

    case TradeResult.EXECUTED:
      return c.json(
        {
          success: true,
          data: "Executed",
        },
        201,
      );
  }
}
