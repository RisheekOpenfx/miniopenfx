import { timestamp, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { db } from "../database/client.js";
import { eq } from "drizzle-orm";

export const trades = pgTable("trades", {
  id: uuid("id").notNull().defaultRandom().primaryKey(),
  user_id: uuid("user_id").notNull(),
  quote_id: uuid("quote_id").notNull(),
  idempotency_key: text("idempotency_key").notNull().unique(),
  executed_at: timestamp("executed_at").notNull().defaultNow(),
});

export async function recordTrade(
  user_id: string,
  quote_id: string,
  idempotency_key: string,
) {
  const [trade] = await db
    .insert(trades)
    .values({
      user_id,
      quote_id,
      idempotency_key,
    })
    .returning({
      id: trades.id,
      executed_at: trades.executed_at,
    });
  return trade;
}

export async function getTradeByIdempotencyKey(idempotency_key: string) {
  const trade = await db
    .select()
    .from(trades)
    .where(eq(trades.idempotency_key, idempotency_key))
    .limit(1)
    .execute();
  return trade[0];
}
