import { pgTable, uuid, text, timestamp, decimal } from "drizzle-orm/pg-core";
import { eq } from "drizzle-orm";
import { db } from "../database/client.js";

export const quotes = pgTable("quotes", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").notNull(),
  pair: text("pair").notNull(),
  side: text("side").notNull(),
  rate: decimal("rate", { precision: 18, scale: 8, mode: "number" }).notNull(),
  status: text("status").notNull(),
  expires_at: timestamp("expires_at").notNull(),
});

export async function createQuote(data: {
  userId: string;
  pair: string;
  side: "BUY" | "SELL";
  rate: number;
}) {
  const [quote] = await db
    .insert(quotes)
    .values({
      user_id: data.userId,
      pair: data.pair,
      side: data.side,
      rate: data.rate,
      status: "ACTIVE",
      expires_at: new Date(Date.now() + 50_000),
    })
    .returning({
      id: quotes.id,
      rate: quotes.rate,
      expires_at: quotes.expires_at,
    });

  return quote;
}

export async function getQuoteById(quoteId: string) {
  const quote = await db
    .select()
    .from(quotes)
    .where(eq(quotes.id, quoteId))
    .limit(1)
    .execute();

  return quote[0];
}

export async function expireQuote(quoteId: string) {
  await db
    .update(quotes)
    .set({ status: "USED" })
    .where(eq(quotes.id, quoteId))
    .execute();
}
