import { Context } from "hono";
import { devAddMoneyService } from "../services/dev.service";
import { success } from "../utilities/response";
import { DbLike } from "../types/types";
import { createDb } from "../database/client";
import * as z from "zod";
import { zcreditObject, zuuid } from "../types/zonSchemes";
import { ErrorCode } from "../errors/error_codes";

export async function devAddMoneyController(c: Context) {
  const headerInput = c.get("userId");
  const log = c.get("logger");
  const userId = zuuid.safeParse(headerInput);
  if (userId instanceof z.ZodError || userId.data === undefined) {
    throw new Error(ErrorCode.ASSERTION_ERROR);
  }

  const db: DbLike = createDb(c.env.DATABASE_URL);
  const input = await c.req.json();
  const safeinput = zcreditObject.safeParse(input);
  if (safeinput instanceof z.ZodError || safeinput.data === undefined) {
    throw new Error(ErrorCode.ASSERTION_ERROR);
  }

  const { currency, amount, reciverEmail } = safeinput.data;
  await devAddMoneyService(
    db,
    reciverEmail,
    currency,
    amount,
    userId.data,
    log,
  );
  return success(c, "Credited!", 201);
}
