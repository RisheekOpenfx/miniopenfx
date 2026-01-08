import { createLedgerEntry } from "../models/ledger_entries.model";
import { getUserById } from "../models/users.model";
import { upsertBalance } from "../models/balances.model";
import { ErrorCode } from "../errors/error_codes";
import { DbLike, userType } from "../types/types";

export async function devAddMoneyService(
  db: DbLike,
  reciverId: string,
  currency: string,
  amount: number,
  userId: string,
): Promise<string> {
  let user: userType | null;
  try {
    user = await getUserById(db, userId);
  } catch (e) {
    console.log(e, "DB Error while getUserById");
    throw new Error(ErrorCode.DB_ERROR);
  }
  if (user === null) {
    throw new Error(ErrorCode.UNAUTHORIZED);
  }
  if (user.role != "admin") {
    throw new Error(ErrorCode.NO_PERMISSION);
  }
  const reason: string = "Credit";
  try {
    await createLedgerEntry(db, {
      userId: userId,
      currency: currency,
      delta: amount,
      reason: reason,
      receiverId: reciverId,
    });
  } catch (e) {
    console.log(e, "DB Error while createLedgerEntry");
    throw new Error(ErrorCode.DB_ERROR);
  }
  try {
    await upsertBalance(db, reciverId, currency, amount);
  } catch (e) {
    console.log(e, "DB Error while upsertBalance");
    throw new Error(ErrorCode.DB_ERROR);
  }
  return "Credited!";
}
