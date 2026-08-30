CREATE TABLE `organization_members` (
	`organization_slug` text NOT NULL,
	`user_id` text NOT NULL,
	`member_role` text DEFAULT 'viewer' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`approved_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`organization_slug`, `user_id`)
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_applications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`opportunity_slug` text NOT NULL,
	`mode` text NOT NULL,
	`status` text DEFAULT 'enviada' NOT NULL,
	`answers_json` text DEFAULT '[]' NOT NULL,
	`profile_snapshot_json` text DEFAULT '{}' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_applications`("id", "user_id", "opportunity_slug", "mode", "status", "answers_json", "profile_snapshot_json", "created_at", "updated_at") SELECT "id", "user_id", "opportunity_slug", "mode", "status", "answers_json", "profile_snapshot_json", "created_at", "updated_at" FROM `applications`;--> statement-breakpoint
DROP TABLE `applications`;--> statement-breakpoint
ALTER TABLE `__new_applications` RENAME TO `applications`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `applications_user_opportunity_unique` ON `applications` (`user_id`,`opportunity_slug`);--> statement-breakpoint
CREATE TABLE `__new_saved_searches` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`label` text NOT NULL,
	`query_json` text NOT NULL,
	`frequency` text DEFAULT 'semanal' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_saved_searches`("id", "user_id", "label", "query_json", "frequency", "active", "created_at", "updated_at") SELECT "id", "user_id", "label", "query_json", "frequency", "active", "created_at", "updated_at" FROM `saved_searches`;--> statement-breakpoint
DROP TABLE `saved_searches`;--> statement-breakpoint
ALTER TABLE `__new_saved_searches` RENAME TO `saved_searches`;