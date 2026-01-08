import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { ErrorCode } from "../errors/error_codes.js";
import { getUserByEmail, createUser } from "../models/users.model.js";
import type { userdata, userType } from "../types/types.js";
import { createSession } from "../models/sessions.model.js";
import { DbLike } from "../types/types.js";

export async function signupUserService(
  db: DbLike,
  email: string,
  password: string,
): Promise<userdata> {
  let existingUser: userType | null;
  try {
    existingUser = await getUserByEmail(db, email);
  } catch (e) {
    console.log(e, "DB Error while getUserByEmail");
    throw new Error(ErrorCode.DB_ERROR);
  }
  if (existingUser) {
    throw new Error(ErrorCode.RESOURCE_ALREADY_EXISTS);
  }

  const hash: string = await bcrypt.hash(password, 10);
  let user: userType;
  try {
    user = await createUser(db, email, hash, "user");
  } catch (e) {
    console.log(e, "DB Error while createUser");
    throw new Error(ErrorCode.DB_ERROR);
  }
  return user;
}

export async function loginService(
  db: DbLike,
  email: string,
  password: string,
): Promise<string> {
  const user: userType | null = await getUserByEmail(db, email);
  if (!user) {
    throw new Error(ErrorCode.INVALID_CREDENTIALS);
  }
  const ok: boolean = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    throw new Error(ErrorCode.INVALID_CREDENTIALS);
  }
  const sessionId: string = uuid();
  const token: string = jwt.sign(
    {
      userId: user.id,
      sessionId,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "1d" },
  );
  const d: Date = new Date();
  try {
    await createSession(
      db,
      sessionId,
      user.id,
      new Date(d.setDate(d.getDate() + 1)),
    );
  } catch (e) {
    console.log(e, "DB Error while createSession");
    throw new Error(ErrorCode.DB_ERROR);
  }

  return token;
}
