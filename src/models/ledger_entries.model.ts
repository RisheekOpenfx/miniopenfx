import { pgTable, decimal, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { db } from "../database/client";
import { eq } from "drizzle-orm";

export const legder_entries = pgTable("ledger_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").notNull(),
  currency: text("currency").notNull(),
  delta: decimal("delta", {
    precision: 18,
    scale: 8,
    mode: "number",
  }).notNull(),
  reason: text("reason").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  receiver_id: uuid("receiver_id").notNull(),
});

export async function createLedgerEntry(data: {
  userId: string;
  currency: string;
  delta: number;
  reason: string;
  receiverId: string;
}) {
  const [entry] = await db
    .insert(legder_entries)
    .values({
      user_id: data.userId,
      currency: data.currency,
      delta: data.delta,
      reason: data.reason,
      receiver_id: data.receiverId,
    })
    .returning({
      id: legder_entries.id,
      user_id: legder_entries.user_id,
      currency: legder_entries.currency,
      delta: legder_entries.delta,
      reason: legder_entries.reason,
      created_at: legder_entries.created_at,
      receiver_id: legder_entries.receiver_id,
    });
  return entry;
}

export async function getLedgerEntriesByUserId(userId: string) {
  const entries = await db
    .select()
    .from(legder_entries)
    .where(eq(legder_entries.user_id, userId));
  return entries;
}
