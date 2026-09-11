ALTER TABLE "workflows" ADD COLUMN "schedule_id" text;--> statement-breakpoint
ALTER TABLE "workflows" ADD COLUMN "schedule_cron" text;--> statement-breakpoint
ALTER TABLE "workflows" ADD COLUMN "schedule_timezone" text;--> statement-breakpoint
ALTER TABLE "workflows" ADD COLUMN "schedule_active" boolean DEFAULT false NOT NULL;