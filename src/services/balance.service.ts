import { getUserBalances } from "../models/balances.model";
import { DbLike, userBalanceType } from "../types/types";
import { ErrorCode } from "../errors/error_codes";
export async function getBalancebyUserService(db: DbLike, userId: string) {
  let balance: userBalanceType[];
  try {
    balance = await getUserBalances(db, userId);
  } catch (e) {
    console.log(e, "DB Error while getUserBalances");
    throw new Error(ErrorCode.DB_ERROR);
  }
  return balance;
}
