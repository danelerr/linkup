CREATE TABLE `moderation_decisions` (
	`id` text PRIMARY KEY NOT NULL,
	`submission_id` text NOT NULL,
	`actor_id` text NOT NULL,
	`status` text NOT NULL,
	`reason` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
