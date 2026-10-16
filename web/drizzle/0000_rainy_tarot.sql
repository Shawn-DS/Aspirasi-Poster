CREATE TABLE `participants` (
	`student_id` text PRIMARY KEY NOT NULL,
	`joined_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
