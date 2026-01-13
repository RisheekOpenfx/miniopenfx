import { success } from "../utilities/response.js";
import { HttpStatus } from "../utilities/http.js";
import { Context } from "hono";
import { signupUserService, loginService } from "../services/auth.service.js";
import { DbLike } from "../types/types.js";
import { createDb } from "../database/client.js";
import * as z from "zod";
import { zcredentials } from "../types/zonSchemes.js";
import { ErrorCode } from "../errors/error_codes.js";

export async function signupController(c: Context) {
  const db: DbLike = createDb(c.env.DATABASE_URL);
  const input = await c.req.json();
  const safeInput = zcredentials.safeParse(input);
  const log = c.get("logger");

  if (safeInput instanceof z.ZodError || safeInput.data === undefined) {
    throw new Error(ErrorCode.ASSERTION_ERROR);
  }
  const { email, password } = safeInput.data;

  await signupUserService(db, email, password, log);

  return success(c, { message: "User created" }, HttpStatus.CREATED);
}

export async function loginController(c: Context) {
  const db: DbLike = createDb(c.env.DATABASE_URL);
  const log = c.get("logger");
  const input = await c.req.json();
  const safeInput = zcredentials.safeParse(input);

  if (safeInput instanceof z.ZodError || safeInput.data === undefined) {
    throw new Error(ErrorCode.ASSERTION_ERROR);
  }
  const { email, password } = safeInput.data;

  const token = await loginService(db, email, password, log);

  return success(c, { token: token }, HttpStatus.OK);
}
