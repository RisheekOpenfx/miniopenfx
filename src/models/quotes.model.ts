import { pgTable, uuid, text, timestamp, numeric } from "drizzle-orm/pg-core";
import { eq } from "drizzle-orm";
import type { DbLike } from "../types/types.js";
import type { quoteType } from "../types/types.js";

export const quotes = pgTable("quotes", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").notNull(),
  pair: text("pair").notNull(),
  side: text("side").notNull(),

  // money/price → numeric (string in DB layer)
  rate: numeric("rate", { precision: 18, scale: 8 }).notNull(),

  status: text("status").notNull(),
  expires_at: timestamp("expires_at").notNull(),
});

type QuoteRow = typeof quotes.$inferSelect;

function mapQuote(row: QuoteRow): quoteType {
  return {
    id: row.id,
    user_id: row.user_id,
    pair: row.pair,
    side: row.side as "BUY" | "SELL",
    rate:
      typeof row.rate === "string" ? Number(row.rate) : (row.rate as number),
    status: row.status,
    expires_at: row.expires_at,
  };
}

export async function createQuote(
  db: DbLike,
  data: {
    userId: string;
    pair: string;
    side: "BUY" | "SELL";
    rate: number;
  },
): Promise<quoteType> {
  const [row] = await db
    .insert(quotes)
    .values({
      user_id: data.userId,
      pair: data.pair,
      side: data.side,
      rate: String(data.rate),
      status: "ACTIVE",
      expires_at: new Date(Date.now() + 50_000),
    })
    .returning();

  return mapQuote(row);
}

export async function getQuoteById(
  db: DbLike,
  quoteId: string,
): Promise<quoteType | null> {
  const [row] = await db
    .select()
    .from(quotes)
    .where(eq(quotes.id, quoteId))
    .limit(1);

  return row ? mapQuote(row) : null;
}

export async function expireQuote(db: DbLike, quoteId: string): Promise<void> {
  await db.update(quotes).set({ status: "USED" }).where(eq(quotes.id, quoteId));
}
