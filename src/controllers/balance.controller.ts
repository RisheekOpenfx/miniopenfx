import { success } from "../utilities/response";
import { Context } from "hono";
import { getBalancebyUserService } from "../services/balance.service";

export async function creditBalanceController(c: Context) {
  const userId = c.get("userId");

  const res = await getBalancebyUserService(userId);

  return success(c, { balances: res }, 200);
}
