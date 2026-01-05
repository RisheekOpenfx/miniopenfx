import { pool } from "../database/db.js";
import { TradeResult } from "../types/trades.js";
import { createLedgerEntry } from "../models/ledger_entries.model.js";
import { getUserBalances, upsertBalance } from "../models/balances.model.js";
import {
  recordTrade,
  getTradeByIdempotencyKey,
} from "../models/trades.model.js";
import {
  getQuoteById,
  expireQuote,
} from "../models/quotes.model.js";
import { db } from "../database/client.js";

export async function trade(
  senderId: string,
  receiverId: string,
  idempotencyKey: string | undefined,
  quoteId: string,
  amount: number,
): Promise<TradeResult> {
  const client = await pool.connect();
  await client.query("BEGIN");

  const dup = await getTradeByIdempotencyKey(idempotencyKey!);
  if (dup !== undefined) {
    return TradeResult.DUPLICATED;
  }

  const q = await getQuoteById(quoteId);
  if (q === undefined || q.status !== "ACTIVE") {
    throw new Error("INVALID_QUOTE");
  }

  if (new Date(q.expires_at) < new Date()) {
    throw new Error("QUOTE_EXPIRED");
  }

  const quote = q;
  const base = quote.pair.slice(0, 3);
  const quoteCur = quote.pair.slice(3);
  const quoteAmt = amount * quote.rate;

  const res = await getUserBalances(senderId).then((balances) => {
    return balances.filter((b) => b.currency === base);
  });

  if (res[0].amount < amount) {
    return TradeResult.REJECTED;
  }

  createLedgerEntry({
    userId: senderId,
    currency: base,
    delta: -amount,
    reason: "FX_TRADE",
    receiverId: receiverId,
  });
  createLedgerEntry({
    userId: receiverId,
    currency: quoteCur,
    delta: quoteAmt,
    reason: "FX_TRADE",
    receiverId: senderId,
  });

  await db.transaction(async (tx) => {
    await upsertBalance(tx, senderId, base, -amount);
    await upsertBalance(tx, receiverId, quoteCur, quoteAmt);
    await recordTrade(senderId, quoteId, idempotencyKey!);
    await expireQuote(quoteId);
  });

  return TradeResult.EXECUTED;
}
