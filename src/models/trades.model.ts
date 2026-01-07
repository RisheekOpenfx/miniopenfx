import { timestamp, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { eq } from "drizzle-orm";
import type { tradeType } from "../types/types.js";
import type { DbLike } from "../types/types.js";

export const trades = pgTable("trades", {
  id: uuid("id").notNull().defaultRandom().primaryKey(),
  user_id: uuid("user_id").notNull(),
  quote_id: uuid("quote_id").notNull(),
  idempotency_key: text("idempotency_key").notNull().unique(),
  executed_at: timestamp("executed_at").notNull().defaultNow(),
});

type TradeRow = typeof trades.$inferSelect;

function mapTrade(row: TradeRow): tradeType {
  return {
    id: row.id,
    user_id: row.user_id,
    quote_id: row.quote_id,
    idempotency_key: row.idempotency_key,
    executed_at: row.executed_at,
  } as tradeType;
}

export async function recordTrade(
  db: DbLike,
  user_id: string,
  quote_id: string,
  idempotency_key: string,
): Promise<void> {
  await db.insert(trades).values({
    user_id,
    quote_id,
    idempotency_key,
  });
}

export async function getTradeByIdempotencyKey(
  db: DbLike,
  idempotency_key: string,
): Promise<tradeType | null> {
  const [row] = await db
    .select()
    .from(trades)
    .where(eq(trades.idempotency_key, idempotency_key))
    .limit(1);

  return row ? mapTrade(row) : null;
}
