import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";
import { eq } from "drizzle-orm";
import type { DbLike } from "../types/types";
import type { sessionType } from "../types/types";

export const sessions = pgTable("sessions", {
  id: uuid("id").notNull().defaultRandom().primaryKey(),
  user_id: uuid("user_id").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  expires_at: timestamp("expires_at").notNull(),
});

type SessionRow = typeof sessions.$inferSelect;

function mapSession(row: SessionRow): sessionType {
  return {
    id: row.id,
    user_id: row.user_id,
    created_at: row.created_at,
    expires_at: row.expires_at,
  } as sessionType;
}

export async function createSession(
  db: DbLike,
  sessionId: string,
  userId: string,
  expiresAt: Date,
): Promise<void> {
  await db.insert(sessions).values({
    id: sessionId,
    user_id: userId,
    expires_at: expiresAt,
  });
}

export async function getSessionById(
  db: DbLike,
  sessionId: string,
): Promise<sessionType | null> {
  const [row] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .limit(1);

  return row ? mapSession(row) : null;
}

export async function deleteSessionById(
  db: DbLike,
  sessionId: string,
): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}
