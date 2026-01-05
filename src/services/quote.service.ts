import { isFresh, refreshPrice, getPrice } from "./price.service.js";
import { createQuote } from "../models/quotes.model.js";

const BUY_SPREAD = 0.0002;
const SELL_SPREAD = 0.0002;

export async function createQuoteService(
  userId: string,
  pair: string,
  side: "BUY" | "SELL",
) {
  if (!isFresh(pair)) {
    await refreshPrice(pair);
  }

  const market = getPrice(pair);
  if (market === null) {
    throw new Error("MARKET_PRICE_UNAVAILABLE");
  }

  const rate =
    side === "BUY" ? market * (1 + BUY_SPREAD) : market * (1 - SELL_SPREAD);

  return createQuote({
    userId,
    pair,
    side,
    rate,
  });
}
