import { createLedgerEntry } from "../models/ledger_entries.model";
import { getUserById } from "../models/users.model";
import { upsertBalance } from "../models/balances.model";
import { ErrorCode } from "../errors/error_codes";
import { DbLike } from "../types/types";

export async function devAddMoneyService(
  db: DbLike,
  reciverId: string,
  currency: string,
  amount: number,
  userId: string,
): Promise<string> {
  const user = await getUserById(db, userId);
  if (user === null) {
    throw new Error(ErrorCode.UNAUTHORIZED);
  }
  if (user.role != "admin") {
    throw new Error(ErrorCode.NO_PERMISSION);
  }
  const reason: string = "Credit";
  await createLedgerEntry(db, {
    userId: userId,
    currency: currency,
    delta: amount,
    reason: reason,
    receiverId: reciverId,
  });
  await upsertBalance(db, reciverId, currency, amount);
  return "Credited!";
}
