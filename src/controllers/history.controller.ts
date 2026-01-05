import { Context } from "hono";
import { success } from "../utilities/response";
import { getLedgerEntriesByUserId } from "../models/ledger_entries.model";

export async function historyController(c: Context) {
  const userId = c.get("userId");
  const result = await getLedgerEntriesByUserId(userId);
  return success(c, { data: result }, 200);
}
