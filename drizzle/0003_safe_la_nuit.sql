CREATE INDEX `application_events_application_idx` ON `application_events` (`application_id`);--> statement-breakpoint
CREATE INDEX `applications_user_idx` ON `applications` (`user_id`);--> statement-breakpoint
CREATE INDEX `moderation_decisions_submission_idx` ON `moderation_decisions` (`submission_id`);--> statement-breakpoint
CREATE INDEX `organization_members_user_idx` ON `organization_members` (`user_id`);--> statement-breakpoint
CREATE INDEX `saved_searches_user_idx` ON `saved_searches` (`user_id`);--> statement-breakpoint
CREATE INDEX `submissions_status_idx` ON `submissions` (`status`);