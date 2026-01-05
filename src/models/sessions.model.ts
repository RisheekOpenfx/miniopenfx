import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";
import { db } from "../database/client";
import { eq } from "drizzle-orm";

export const sessions = pgTable("sessions", {
  id: uuid("id").notNull().defaultRandom().primaryKey(),
  user_id: uuid("user_id").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  expires_at: timestamp("expires_at").notNull(),
});

export async function createSession(
  sessionId: string,
  userId: string,
  expiresAt: Date,
) {
  await db.insert(sessions).values({
    id: sessionId,
    user_id: userId,
    expires_at: expiresAt,
  });
}

export async function getSessionById(sessionId: string) {
  const session = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .limit(1);
  return session[0];
}

export async function deleteSessionById(sessionId: string) {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}
