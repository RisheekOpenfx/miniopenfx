import { pgTable, numeric, text, uuid, primaryKey } from "drizzle-orm/pg-core";
import { eq, sql } from "drizzle-orm";
import type { DbLike } from "../types/types.js";
import type { userBalanceType } from "../types/types.js";

export const balances = pgTable(
  "balances",
  {
    user_id: uuid("user_id").notNull(),
    currency: text("currency").notNull(),
    amount: numeric("amount", { precision: 18, scale: 8, mode: "number" }).notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.user_id, t.currency] }),
  }),
);

function mapBalance(row: typeof balances.$inferSelect): userBalanceType {
  return {
    ...row,
    amount:
      typeof row.amount === "string"
        ? Number(row.amount)
        : (row.amount as number),
  } as userBalanceType;
}

export async function getUserBalances(
  db: DbLike,
  userId: string,
): Promise<userBalanceType[]> {
  const rows = await db
    .select()
    .from(balances)
    .where(eq(balances.user_id, userId));

  return rows.map(mapBalance);
}

export async function upsertBalance(
  tx: DbLike,
  user_id: string,
  currency: string,
  delta: number,
): Promise<void> {
  await tx
    .insert(balances)
    .values({
      user_id,
      currency,
      amount: delta,
    })
    .onConflictDoUpdate({
      target: [balances.user_id, balances.currency],
      set: {
        amount: sql`${Number(balances.amount)} + ${delta}`,
      },
    });
}
