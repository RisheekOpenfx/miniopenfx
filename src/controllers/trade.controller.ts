import { Context } from "hono";
import { trade } from "../services/trade.service.js";
import { success } from "../utilities/response.js";
import { DbLike } from "../types/types.js";
import { createDb } from "../database/client.js";
import { getUserByEmail } from "../models/users.model.js";
import { ErrorCode } from "../errors/error_codes.js";
import { zuuid } from "../types/zonSchemes.js";
import * as z from "zod";
import { ztrade } from "../types/zonSchemes.js";
import { getAmouontByQuote } from "../models/quotes.model.js";

export async function selfTradeController(c: Context) {
  const db: DbLike = createDb(c.env.DATABASE_URL);
  const idInput = c.get("userId");
  const safeIdInput = zuuid.safeParse(idInput);
  if(safeIdInput instanceof z.ZodError || safeIdInput.data === undefined){
    throw new Error(ErrorCode.ASSERTION_ERROR);
  }
  const userId = safeIdInput.data;
  const idemInput = c.req.header("Idempotency-Key");
  const safeidem = z.string().safeParse(idemInput);
  if(safeidem instanceof z.ZodError || safeidem.data === undefined){
    throw new Error(ErrorCode.ASSERTION_ERROR);
  }
  const idempotencyKey = safeidem.data;
  const input = await c.req.json();
  const safeinput = ztrade.safeParse(input);
  if(safeinput instanceof z.ZodError || safeinput.data === undefined){
    throw new Error(ErrorCode.ASSERTION_ERROR);
  }
  const { quoteId } = safeinput.data;

  const amount = Number(await getAmouontByQuote(db, quoteId));

  await trade(db, userId, userId, idempotencyKey, quoteId, amount);

  return success(c, "Executed", 201);
}

export async function otherTradeController(c: Context) {
  const idInput = c.get("userId");
  const safeIdInput = zuuid.safeParse(idInput);
  if(safeIdInput instanceof z.ZodError || safeIdInput.data === undefined){
    throw new Error(ErrorCode.ASSERTION_ERROR);
  }
  const userId = safeIdInput.data;
  const db: DbLike = createDb(c.env.DATABASE_URL);
  const idemInput = c.req.header("Idempotency-Key");
  const safeidem = z.string().safeParse(idemInput);
  if(safeidem instanceof z.ZodError || safeidem.data === undefined){
    throw new Error(ErrorCode.ASSERTION_ERROR);
  }
  const idempotencyKey = safeidem.data;
  const input = await c.req.json();
  const safeinput = ztrade.safeParse(input);
  if(safeinput instanceof z.ZodError || safeinput.data === undefined){
    throw new Error(ErrorCode.ASSERTION_ERROR);
  }
  const { quoteId, reciverEmail } = safeinput.data;
  if(reciverEmail === null || reciverEmail === undefined){
    throw new Error(ErrorCode.ASSERTION_ERROR)
  }
  const receiver = await getUserByEmail(db, reciverEmail);
  if (receiver?.id === undefined) {
    throw new Error(ErrorCode.USER_DOESNT_EXIST);
  }
  const receiverId = receiver.id;
  const amount = Number(await getAmouontByQuote(db, quoteId));

  await trade(db, userId, receiverId, idempotencyKey, quoteId, amount);

  return success(c, "Executed", 201);
}
