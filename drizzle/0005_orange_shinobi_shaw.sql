ALTER TABLE `submissions` ADD `canonical_key` text;--> statement-breakpoint
ALTER TABLE `submissions` ADD `normalized_name` text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `submissions_pending_source_unique` ON `submissions` (`kind`,`canonical_key`) WHERE "submissions"."status" = 'pending';--> statement-breakpoint
CREATE INDEX `submissions_name_idx` ON `submissions` (`kind`,`status`,`normalized_name`);--> statement-breakpoint
CREATE INDEX `submissions_contact_date_idx` ON `submissions` (`contact_email`,`created_at`);