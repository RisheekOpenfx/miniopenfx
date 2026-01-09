import { Context } from "hono";
import { success } from "../utilities/response";
import { getPriceMultiple } from "../services/price.service";
import { ErrorCode } from "../errors/error_codes";
import * as z from "zod";
import { log } from "console";
import { Logger } from "pino";

export async function priceController(c: Context) {
  const id = c.env.FX_DO.idFromName("binance-fx");
  const stub = c.env.FX_DO.get(id);
  const log:Logger = c.get("logger");
  const input = c.req.query("symbols");
  const safeinput = z.string().min(6).max(7).safeParse(input);
  if(safeinput instanceof z.ZodError || safeinput.data === undefined){
    throw new Error(ErrorCode.ASSERTION_ERROR);
  }
  const symbol = safeinput.data;
  const result = await getPriceMultiple(symbol, stub, log);
  return success(c, result, 200);
}
