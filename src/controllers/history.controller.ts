import { Context } from "hono";
import { success } from "../utilities/response";
import { getLedgerEntriesByUserId } from "../models/ledger_entries.model";
import { UUID } from "crypto";
import { DbLike } from "../types/types";
import { createDb } from "../database/client";

export async function historyController(c: Context) {
  const db: DbLike = createDb(c.env.DATABASE_URL);
  const userId: UUID = c.get("userId");
  const result = await getLedgerEntriesByUserId(db, userId);
  return success(c, result, 200);
}
