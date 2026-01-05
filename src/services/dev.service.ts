import { createLedgerEntry } from "../models/ledger_entries.model";
import { getUserById } from "../models/users.model";

export async function devAddMoneyService(
  reciverId: string,
  currency: string,
  amount: number,
  userId: string,
) {
  const user = await getUserById(reciverId);
  if (user.role != "admin") {
    throw new Error("No permission");
  }
  const reason: string = "Credit";
  await createLedgerEntry({
    userId: reciverId,
    currency: currency,
    delta: amount,
    reason: reason,
    receiverId: userId,
  });
  return "Credited!";
}
