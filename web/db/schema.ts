import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

// Attendance is separate from the chat. No answers or conversation identifiers.
export const participants = sqliteTable("participants", {
  studentId: text("student_id").primaryKey(),
  joinedAt: text("joined_at").notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
});
