import { createLedgerEntry } from "../models/ledger_entries.model.js";
import { getUserBalances, upsertBalance } from "../models/balances.model.js";
import {
  recordTrade,
  getTradeByIdempotencyKey,
} from "../models/trades.model.js";
import { getQuoteById, expireQuote } from "../models/quotes.model.js";
import { ErrorCode } from "../errors/error_codes.js";
import {
  DbLike,
  quoteType,
  tradeType,
  userBalanceType,
} from "../types/types.js";

export async function trade(
  db: DbLike,
  senderId: string,
  receiverId: string,
  idempotencyKey: string | undefined,
  quoteId: string,
  amount: number,
): Promise<string> {
  const dup: tradeType | null = await getTradeByIdempotencyKey(
    db,
    idempotencyKey!,
  );
  if (dup !== null) {
    throw new Error(ErrorCode.DUPLICATE_TRADE);
  }

  const q: quoteType | null = await getQuoteById(db, quoteId);
  if (q === undefined || q === null || q.status !== "ACTIVE") {
    throw new Error(ErrorCode.INVALID_QUOTE);
  }

  if (new Date(q.expires_at) < new Date()) {
    throw new Error(ErrorCode.QUOTE_EXPIRED);
  }

  const quote: quoteType = q;
  const base: string = quote.pair.slice(0, 3);
  const quoteCur: string = quote.pair.slice(3);
  const quoteAmt: number = amount * quote.rate;

  const res: userBalanceType[] = await getUserBalances(db, senderId).then(
    (balances) => {
      return balances.filter((b) => b.currency === base);
    },
  );
  if (res === undefined) {
    throw new Error(ErrorCode.INSUFFICIENT_BALANCE);
  }

  if (res[0].amount < amount) {
    throw new Error(ErrorCode.INSUFFICIENT_BALANCE);
  }

  await createLedgerEntry(db, {
    userId: senderId,
    currency: base,
    delta: -amount,
    reason: "FX_TRADE",
    receiverId: receiverId,
  });
  await createLedgerEntry(db, {
    userId: receiverId,
    currency: quoteCur,
    delta: quoteAmt,
    reason: "FX_TRADE",
    receiverId: senderId,
  });

  await upsertBalance(db, senderId, base, -amount);
  await upsertBalance(db, receiverId, quoteCur, quoteAmt);
  await recordTrade(db, senderId, quoteId, idempotencyKey!);
  await expireQuote(db, quoteId);

  return "Executed";
}
