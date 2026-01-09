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
import { Logger } from "pino";


export async function TradeController(c: Context) {
  const idInput = c.get("userId");
  const safeIdInput = zuuid.safeParse(idInput);
  const log:Logger = c.get("logger");
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
  let { quoteId, reciverEmail } = safeinput.data;
  let receiverId;
  if(reciverEmail === null || reciverEmail === undefined){
    receiverId = userId;
  }
  else{
  const receiver = await getUserByEmail(db, reciverEmail);
  if (receiver?.id === undefined) {
    throw new Error(ErrorCode.USER_DOESNT_EXIST);
  }
  receiverId = receiver.id;
  }
  const quote = (await getAmouontByQuote(db, quoteId))!;
  const amount = quote.quote / quote.rate;

  await trade(db, userId, receiverId, idempotencyKey, quoteId, amount, log);

  return success(c, "Executed", 201);
}
