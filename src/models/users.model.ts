import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { eq } from "drizzle-orm";
import type { userType } from "../types/types";
import type { DbLike } from "../types/types";

export const users = pgTable("users", {
  id: uuid("id").notNull().defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  role: text("role").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

type UserRow = typeof users.$inferSelect;

function mapUser(row: UserRow): userType {
  return {
    id: row.id,
    email: row.email,
    password_hash: row.password_hash,
    role: row.role,
    created_at: row.created_at,
  } as userType;
}

export async function getUserByEmail(
  db: DbLike,
  email: string,
): Promise<userType | null> {
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return row ? mapUser(row) : null;
}

export async function createUser(
  db: DbLike,
  email: string,
  passwordHash: string,
  role: string,
): Promise<userType> {
  const [row] = await db
    .insert(users)
    .values({
      email,
      password_hash: passwordHash,
      role,
    })
    .returning();

  if (!row) {
    throw new Error("Failed to create user");
  }

  return mapUser(row);
}

export async function getUserById(
  db: DbLike,
  userId: string,
): Promise<userType | null> {
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return row ? mapUser(row) : null;
}
