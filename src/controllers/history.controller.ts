import { Context } from "hono";
import { success } from "../utilities/response";
import { getLedgerEntriesByUserId } from "../models/ledger_entries.model";
import { DbLike } from "../types/types";
import { createDb } from "../database/client";
import { zuuid } from "../types/zonSchemes";
import * as z from "zod";
import { ErrorCode } from "../errors/error_codes";

export async function historyController(c: Context) {
  const db: DbLike = createDb(c.env.DATABASE_URL);
  const input = c.get("userId");
  const safeinput = zuuid.safeParse(input);
  if (safeinput instanceof z.ZodError || safeinput.data === undefined) {
    throw new Error(ErrorCode.ASSERTION_ERROR);
  }
  const userId = safeinput.data;
  const result = await getLedgerEntriesByUserId(db, userId);
  return success(c, result, 200);
}
