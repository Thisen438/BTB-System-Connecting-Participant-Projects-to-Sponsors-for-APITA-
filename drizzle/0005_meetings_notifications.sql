CREATE TYPE "public"."meeting_mode" AS ENUM('in_person', 'online');--> statement-breakpoint
CREATE TYPE "public"."meeting_status" AS ENUM('pending', 'accepted', 'declined');--> statement-breakpoint
CREATE TABLE "meetings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"investor_id" uuid NOT NULL,
	"owner_id" uuid NOT NULL,
	"mode" "meeting_mode" NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"proposed_slots" text[] NOT NULL,
	"awaiting" "user_role" DEFAULT 'participant' NOT NULL,
	"status" "meeting_status" DEFAULT 'pending' NOT NULL,
	"scheduled_at" timestamp with time zone,
	"meeting_link" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "meetings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"meeting_id" uuid NOT NULL,
	"body" text NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_investor_id_profiles_id_fk" FOREIGN KEY ("investor_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_owner_id_profiles_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_meeting_id_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."meetings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "meetings_investor_idx" ON "meetings" USING btree ("investor_id");--> statement-breakpoint
CREATE INDEX "meetings_owner_idx" ON "meetings" USING btree ("owner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "meetings_open_idx" ON "meetings" USING btree ("project_id","investor_id") WHERE "meetings"."status" <> 'declined';--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE POLICY "notifications_select_own" ON "notifications" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("notifications"."user_id" = (select auth.uid()));--> statement-breakpoint
-- Added by hand: let the browser read its own notifications, and send new ones live over Supabase Realtime.
GRANT SELECT ON "notifications" TO "authenticated";--> statement-breakpoint
ALTER PUBLICATION supabase_realtime ADD TABLE "notifications";
