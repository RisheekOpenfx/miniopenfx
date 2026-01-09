import { isFresh, refreshPrice, getPrice } from "./price.service.js";
import { createQuote } from "../models/quotes.model.js";
import { ErrorCode } from "../errors/error_codes.js";
import { DbLike, quoteType } from "../types/types.js";
import type { PriceEntry } from "../types/types.js";
import { Logger } from "pino";

const BUY_SPREAD: number = 0.0002;
const SELL_SPREAD: number = 0.0002;

export async function createQuoteService(
  db: DbLike,
  userId: string,
  pair: string,
  side: "BUY" | "SELL",
  amount: number,
  priceCache: KVNamespace,
  stub:any,
  log: Logger
): Promise<quoteType> {
  if (!await isFresh(pair, priceCache)) {
    await refreshPrice(pair, priceCache, stub);
  }
  const price: PriceEntry | null = await getPrice(pair, priceCache);
  if (price === null) {
    throw new Error(ErrorCode.MARKET_PRICE_UNAVAILABLE);
  }
  const market = price.rate;
  const rate: number =
    side === "BUY" ? market * (1 + BUY_SPREAD) : market * (1 - SELL_SPREAD);
  let quote;
  try {
    quote = await createQuote(db, { userId, pair, side, rate,quote: amount*rate });
  } catch (e) {
    log.info(e, "DB Error while CreateQuote");
    throw new Error(ErrorCode.DB_ERROR);
  }
  return quote;
}
