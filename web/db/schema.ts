import { sql } from "drizzle-orm";
import { check, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Attendance is separate from the chat. No answers or conversation identifiers.
export const participants = sqliteTable("participants", {
  studentId: text("student_id").primaryKey(),
  joinedAt: text("joined_at").notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
});

// Aggregate counters have no participant or receipt link.
export const statisticsCounters = sqliteTable(
  "statistics_counters",
  {
    counterKey: text("counter_key").primaryKey(),
    count: integer("count").notNull().default(0),
  },
  table => [check("statistics_counters_non_negative", sql`${table.count} >= 0`)]
);

// Random event hashes exist only to make retries idempotent; nothing identifies
// the event type, person, session, chosen answer or time.
export const statisticsReceipts = sqliteTable(
  "statistics_receipts",
  {
    receiptHash: text("receipt_hash").primaryKey(),
  },
  table => [check("statistics_receipts_sha256_len", sql`length(${table.receiptHash}) = 64`)]
);
