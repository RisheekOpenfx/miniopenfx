import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { eq } from "drizzle-orm";
import { db } from "../database/client";

export const users = pgTable("users", {
  id: uuid("id").notNull().defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  role: text("role").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export async function getUserByEmail(email: string) {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return user[0];
}

export async function createUser(
  email: string,
  passwordHash: string,
  role: string,
) {
  const newUser = await db
    .insert(users)
    .values({
      email,
      password_hash: passwordHash,
      role,
    })
    .returning();
  return newUser[0];
}

export async function getUserById(userId: string) {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return user[0];
}
