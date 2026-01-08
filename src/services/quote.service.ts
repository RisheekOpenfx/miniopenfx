import { isFresh, refreshPrice, getPrice } from "./price.service.js";
import { createQuote } from "../models/quotes.model.js";
import { ErrorCode } from "../errors/error_codes.js";
import { DbLike, quoteType } from "../types/types.js";

const BUY_SPREAD: number = 0.0002;
const SELL_SPREAD: number = 0.0002;

export async function createQuoteService(
  db: DbLike,
  userId: string,
  pair: string,
  side: "BUY" | "SELL",
): Promise<quoteType> {
  if (!isFresh(pair)) {
    await refreshPrice(pair);
  }

  const market: number | null = getPrice(pair);
  if (market === null) {
    throw new Error(ErrorCode.MARKET_PRICE_UNAVAILABLE);
  }

  const rate: number =
    side === "BUY" ? market * (1 + BUY_SPREAD) : market * (1 - SELL_SPREAD);
  let quote;
  try {
    quote = await createQuote(db, { userId, pair, side, rate });
  } catch (e) {
    console.log(e, "DB Error while CreateQuote");
    throw new Error(ErrorCode.DB_ERROR);
  }
  return quote;
}
