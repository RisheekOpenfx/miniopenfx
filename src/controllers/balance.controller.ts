import { success } from "../utilities/response";
import { Context } from "hono";

import { getBalancebyUserService } from "../services/balance.service";
import { DbLike } from "../types/types";
import { createDb } from "../database/client";
import { zuuid } from "../types/zonSchemes";
import * as z from "zod";
import { ErrorCode } from "../errors/error_codes";

export async function creditBalanceController(c: Context) {
  const db: DbLike = createDb(c.env.DATABASE_URL);
  const log = c.get("logger");
  const input = c.get("userId");
  const userId = zuuid.safeParse(input);
  if (userId instanceof z.ZodError || userId.data === undefined) {
    throw new Error(ErrorCode.ASSERTION_ERROR);
  }

  const res = await getBalancebyUserService(db, userId.data, log);

  return success(c, { balances: res }, 200);
}
