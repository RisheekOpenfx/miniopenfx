import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { HttpStatus } from "../types/http.js";
import { ErrorCode } from "../types/error_codes.js";
import { AppError } from "../errors/app_error.js";
import { getUserByEmail, createUser } from "../models/users.model.js";
import type { userdata } from "../types/types.js";
import { createSession } from "../models/sessions.model.js";

export async function signupUserService(
  email: string,
  password: string,
): Promise<userdata> {
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new AppError(
      HttpStatus.CONFLICT,
      ErrorCode.RESOURCE_ALREADY_EXISTS,
      "User already exists",
    );
  }

  const hash = await bcrypt.hash(password, 10);

  return createUser(email, hash, "user");
}

export async function loginService(
  email: string,
  password: string,
): Promise<string> {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new AppError(
      HttpStatus.UNAUTHORIZED,
      ErrorCode.INVALID_CREDENTIALS,
      "Invalid username or password",
    );
  }
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    throw new AppError(
      HttpStatus.UNAUTHORIZED,
      ErrorCode.INVALID_CREDENTIALS,
      "Invalid username or password",
    );
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
  createSession(sessionId, user.id, new Date(d.setDate(d.getDate() + 1)));

  return token;
}
