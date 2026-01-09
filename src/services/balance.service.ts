import { getUserBalances } from "../models/balances.model";
import { DbLike, userBalanceType } from "../types/types";
import { ErrorCode } from "../errors/error_codes";
import { Logger } from "pino";
export async function getBalancebyUserService(db: DbLike, userId: string, log:Logger) {
  let balance: userBalanceType[];
  try {
    balance = await getUserBalances(db, userId);
  } catch (e) {
    log.info(e, "DB Error while getUserBalances");
    throw new Error(ErrorCode.DB_ERROR);
  }
  return balance;
}
