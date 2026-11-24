CREATE TABLE `checker_usage` (
	`user_id` text PRIMARY KEY NOT NULL,
	`email` text,
	`checks_used` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
