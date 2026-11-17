CREATE TABLE "rachaon_event_shares" (
	"id" text PRIMARY KEY NOT NULL,
	"resource_id" text NOT NULL,
	"principal_type" text NOT NULL,
	"principal_id" text NOT NULL,
	"role" text DEFAULT 'viewer' NOT NULL,
	"created_by" text DEFAULT '' NOT NULL,
	"created_at" text DEFAULT now() NOT NULL,
	"notified_at" text
);
--> statement-breakpoint
CREATE TABLE "rachaon_events" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"event_date" text NOT NULL,
	"total_spent_cents" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"registered_participants" integer DEFAULT 1 NOT NULL,
	"guest_participants" integer DEFAULT 0 NOT NULL,
	"created_at" text DEFAULT now() NOT NULL,
	"updated_at" text DEFAULT now() NOT NULL,
	"owner_email" text DEFAULT 'local@localhost' NOT NULL,
	"org_id" text,
	"visibility" text DEFAULT 'private' NOT NULL
);
