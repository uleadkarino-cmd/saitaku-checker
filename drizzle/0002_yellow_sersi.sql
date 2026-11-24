ALTER TABLE `contact_inquiries` ADD `status` text DEFAULT 'unread' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_inquiries` ADD `status_updated_at` text;