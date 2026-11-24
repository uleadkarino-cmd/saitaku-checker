CREATE TABLE `contact_inquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`login_email` text,
	`reply_email` text NOT NULL,
	`name` text,
	`category` text NOT NULL,
	`paid_features` text,
	`message` text NOT NULL,
	`diagnostics` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_contact_inquiries_user_created` ON `contact_inquiries` (`user_id`,`created_at`);