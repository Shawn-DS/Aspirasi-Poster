CREATE TABLE IF NOT EXISTS `statistics_counters` (
  `counter_key` text PRIMARY KEY NOT NULL,
  `count` integer DEFAULT 0 NOT NULL CHECK (`count` >= 0)
);
CREATE TABLE IF NOT EXISTS `statistics_receipts` (
  `receipt_hash` text PRIMARY KEY NOT NULL CHECK (length(`receipt_hash`) = 64)
);
