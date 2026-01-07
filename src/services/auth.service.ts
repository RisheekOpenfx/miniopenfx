import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { ErrorCode } from "../errors/error_codes.js";
import { getUserByEmail, createUser } from "../models/users.model.js";
import type { userdata } from "../types/types.js";
import { createSession } from "../models/sessions.model.js";
import { DbLike } from "../types/types.js";

export async function signupUserService(
  db: DbLike,
  email: string,
  password: string,
): Promise<userdata> {
  const existingUser = await getUserByEmail(db, email);
  if (existingUser) {
    throw new Error(ErrorCode.RESOURCE_ALREADY_EXISTS);
  }

  const hash = await bcrypt.hash(password, 10);

  return createUser(db, email, hash, "user");
}

export async function loginService(
  db: DbLike,
  email: string,
  password: string,
): Promise<string> {
  const user = await getUserByEmail(db, email);
  if (!user) {
    throw new Error(ErrorCode.INVALID_CREDENTIALS);
  }
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    throw new Error(ErrorCode.INVALID_CREDENTIALS);
  }
  const sessionId = uuid();
  const token = jwt.sign(
    {
      userId: user.id,
      sessionId,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "1d" },
  );
  const d = new Date();
  await createSession(
    db,
    sessionId,
    user.id,
    new Date(d.setDate(d.getDate() + 1)),
  );

  return token;
}
