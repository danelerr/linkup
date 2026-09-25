CREATE TABLE `alert_notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`search_id` text NOT NULL,
	`opportunity_slug` text NOT NULL,
	`created_at` text NOT NULL,
	`read_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `alert_notification_unique` ON `alert_notifications` (`search_id`,`opportunity_slug`);--> statement-breakpoint
CREATE INDEX `alert_notification_user_idx` ON `alert_notifications` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `catalog_opportunities` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`organization_slug` text NOT NULL,
	`title` text NOT NULL,
	`area` text NOT NULL,
	`type` text NOT NULL,
	`modality` text NOT NULL,
	`level` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`closes_at` text,
	`source_key` text,
	`search_text` text NOT NULL,
	`data_json` text NOT NULL,
	`published_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`organization_slug`) REFERENCES `catalog_organizations`(`slug`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `catalog_opportunities_slug_unique` ON `catalog_opportunities` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `catalog_opportunities_source_key_unique` ON `catalog_opportunities` (`source_key`);--> statement-breakpoint
CREATE INDEX `catalog_opportunities_org_idx` ON `catalog_opportunities` (`organization_slug`,`status`,`closes_at`);--> statement-breakpoint
CREATE INDEX `catalog_opportunities_filter_idx` ON `catalog_opportunities` (`status`,`modality`,`type`,`area`);--> statement-breakpoint
CREATE TABLE `catalog_organizations` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`industry` text NOT NULL,
	`website_key` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`search_text` text NOT NULL,
	`data_json` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `catalog_organizations_slug_unique` ON `catalog_organizations` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `catalog_organizations_website_key_unique` ON `catalog_organizations` (`website_key`);--> statement-breakpoint
CREATE INDEX `catalog_organizations_filter_idx` ON `catalog_organizations` (`status`,`industry`);--> statement-breakpoint
ALTER TABLE `submissions` ADD `payload_json` text DEFAULT '{}' NOT NULL;