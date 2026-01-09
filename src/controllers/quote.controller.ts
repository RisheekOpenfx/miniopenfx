import { Context } from "hono";
import { createQuoteService } from "../services/quote.service.js";
import { success } from "../utilities/response.js";
import { DbLike, quoteType } from "../types/types.js";
import { createDb } from "../database/client.js";
import { zuuid } from "../types/zonSchemes.js";
import * as z from "zod";
import { ErrorCode } from "../errors/error_codes.js";
import { Logger } from "pino";

export async function quoteController(c: Context) {
  const id = c.env.FX_DO.idFromName("binance-fx");
  const stub = c.env.FX_DO.get(id);
  const input = c.get("userId");
  const log: Logger = c.get("logger");
  const safeinput = zuuid.safeParse(input);
  if(safeinput instanceof z.ZodError || safeinput.data === undefined){
    throw new Error(ErrorCode.ASSERTION_ERROR);
  }
  const userId = safeinput.data;
  const { pair, side, amount } = await c.req.json();

  const db: DbLike = createDb(c.env.DATABASE_URL);
  const quote:quoteType = await createQuoteService(db, userId, pair, side, amount, c.env.pricecache, stub, log);
  return success(c, quote, 201);
}
