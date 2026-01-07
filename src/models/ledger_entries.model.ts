import { pgTable, numeric, uuid, text, timestamp } from "drizzle-orm/pg-core";
import type { DbLike } from "../types/types";
import { eq } from "drizzle-orm";
import type { LedgerEntryType } from "../types/types";

export const ledger_entries = pgTable("ledger_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").notNull(),
  currency: text("currency").notNull(),

  delta: numeric("delta", { precision: 18, scale: 8 }).notNull(),

  reason: text("reason").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  receiver_id: uuid("receiver_id").notNull(),
});

type LedgerRow = typeof ledger_entries.$inferSelect;

function mapEntry(row: LedgerRow): LedgerEntryType {
  return {
    id: row.id,
    user_id: row.user_id,
    currency: row.currency,
    delta:
      typeof row.delta === "string" ? Number(row.delta) : (row.delta as number),
    reason: row.reason,
    created_at: row.created_at,
    receiver_id: row.receiver_id,
  };
}

export async function createLedgerEntry(
  db: DbLike,
  data: {
    userId: string;
    currency: string;
    delta: number;
    reason: string;
    receiverId: string;
  },
): Promise<LedgerEntryType> {
  const [row] = await db
    .insert(ledger_entries)
    .values({
      user_id: data.userId,
      currency: data.currency,
      delta: String(data.delta),
      reason: data.reason,
      receiver_id: data.receiverId,
    })
    .returning();

  if (!row) {
    throw new Error("Failed to create ledger entry");
  }

  return mapEntry(row);
}

export async function getLedgerEntriesByUserId(
  db: DbLike,
  userId: string,
): Promise<LedgerEntryType[]> {
  const rows = await db
    .select()
    .from(ledger_entries)
    .where(eq(ledger_entries.user_id, userId));

  return rows.map(mapEntry);
}
