CREATE TABLE "alert_notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"search_id" text NOT NULL,
	"opportunity_slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"read_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "application_events" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text NOT NULL,
	"status" text NOT NULL,
	"actor" text NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"opportunity_slug" text NOT NULL,
	"mode" text NOT NULL,
	"status" text DEFAULT 'enviada' NOT NULL,
	"answers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"profile_snapshot" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_events" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_id" text NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"detail" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_rate_limit" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"count" integer NOT NULL,
	"last_request" bigint NOT NULL,
	CONSTRAINT "auth_rate_limit_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "auth_session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "auth_session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "auth_user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "auth_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "auth_verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "catalog_opportunities" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"organization_slug" text NOT NULL,
	"title" text NOT NULL,
	"area" text NOT NULL,
	"type" text NOT NULL,
	"modality" text NOT NULL,
	"level" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"closes_at" date,
	"source_key" text,
	"search_text" text NOT NULL,
	"data" jsonb NOT NULL,
	"published_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "catalog_opportunities_slug_unique" UNIQUE("slug"),
	CONSTRAINT "catalog_opportunities_source_key_unique" UNIQUE("source_key")
);
--> statement-breakpoint
CREATE TABLE "catalog_organizations" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"industry" text NOT NULL,
	"website_key" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"search_text" text NOT NULL,
	"data" jsonb NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "catalog_organizations_slug_unique" UNIQUE("slug"),
	CONSTRAINT "catalog_organizations_website_key_unique" UNIQUE("website_key")
);
--> statement-breakpoint
CREATE TABLE "moderation_decisions" (
	"id" text PRIMARY KEY NOT NULL,
	"submission_id" text NOT NULL,
	"actor_id" text NOT NULL,
	"status" text NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_members" (
	"organization_slug" text NOT NULL,
	"user_id" text NOT NULL,
	"member_role" text DEFAULT 'viewer' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"approved_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organization_members_organization_slug_user_id_pk" PRIMARY KEY("organization_slug","user_id")
);
--> statement-breakpoint
CREATE TABLE "saved_opportunities" (
	"user_id" text NOT NULL,
	"opportunity_slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "saved_opportunities_user_id_opportunity_slug_pk" PRIMARY KEY("user_id","opportunity_slug")
);
--> statement-breakpoint
CREATE TABLE "saved_searches" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"label" text NOT NULL,
	"query" jsonb NOT NULL,
	"frequency" text DEFAULT 'semanal' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"contact_email" text NOT NULL,
	"kind" text NOT NULL,
	"organization_name" text NOT NULL,
	"website_url" text DEFAULT '' NOT NULL,
	"opportunity_title" text DEFAULT '' NOT NULL,
	"source_url" text NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"canonical_key" text,
	"normalized_name" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "talent_profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"objective" text DEFAULT '' NOT NULL,
	"city" text DEFAULT '' NOT NULL,
	"country" text DEFAULT '' NOT NULL,
	"modality" text DEFAULT '' NOT NULL,
	"availability" text DEFAULT '' NOT NULL,
	"skills" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"bio" text DEFAULT '' NOT NULL,
	"portfolio_url" text DEFAULT '' NOT NULL,
	"privacy" text DEFAULT 'private' NOT NULL,
	"is_adult" boolean DEFAULT false NOT NULL,
	"accepted_terms_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"display_name" text NOT NULL,
	"role" text DEFAULT 'talent' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auth_account" ADD CONSTRAINT "auth_account_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_session" ADD CONSTRAINT "auth_session_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog_opportunities" ADD CONSTRAINT "catalog_opportunities_organization_slug_catalog_organizations_slug_fk" FOREIGN KEY ("organization_slug") REFERENCES "public"."catalog_organizations"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "alert_notification_unique" ON "alert_notifications" USING btree ("search_id","opportunity_slug");--> statement-breakpoint
CREATE INDEX "alert_notification_user_idx" ON "alert_notifications" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "application_events_application_idx" ON "application_events" USING btree ("application_id");--> statement-breakpoint
CREATE UNIQUE INDEX "applications_user_opportunity_unique" ON "applications" USING btree ("user_id","opportunity_slug");--> statement-breakpoint
CREATE INDEX "applications_user_idx" ON "applications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "auth_account_user_idx" ON "auth_account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "auth_session_user_idx" ON "auth_session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "auth_verification_identifier_idx" ON "auth_verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "catalog_opportunities_org_idx" ON "catalog_opportunities" USING btree ("organization_slug","status","closes_at");--> statement-breakpoint
CREATE INDEX "catalog_opportunities_filter_idx" ON "catalog_opportunities" USING btree ("status","modality","type","area");--> statement-breakpoint
CREATE INDEX "catalog_organizations_filter_idx" ON "catalog_organizations" USING btree ("status","industry");--> statement-breakpoint
CREATE INDEX "moderation_decisions_submission_idx" ON "moderation_decisions" USING btree ("submission_id");--> statement-breakpoint
CREATE INDEX "organization_members_user_idx" ON "organization_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "saved_searches_user_idx" ON "saved_searches" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "submissions_status_idx" ON "submissions" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "submissions_pending_source_unique" ON "submissions" USING btree ("kind","canonical_key") WHERE "submissions"."status" = 'pending';--> statement-breakpoint
CREATE INDEX "submissions_name_idx" ON "submissions" USING btree ("kind","status","normalized_name");--> statement-breakpoint
CREATE INDEX "submissions_contact_date_idx" ON "submissions" USING btree ("contact_email","created_at");--> statement-breakpoint
CREATE INDEX "submissions_user_date_idx" ON "submissions" USING btree ("user_id","created_at");