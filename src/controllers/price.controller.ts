import { Context } from "hono";
import { success } from "../utilities/response";
import { getPriceMultiple } from "../services/price.service";

export async function priceController(c: Context) {
  const id = c.env.FX_DO.idFromName("binance-fx");
  const stub = c.env.FX_DO.get(id);
  const symbol = c.req.query("symbols");
  const result = await getPriceMultiple(symbol, stub);
  return success(c, result, 200);
}
