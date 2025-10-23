CREATE TABLE "moodboard" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"projectId" text NOT NULL,
	"userId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "moodboard" ADD CONSTRAINT "moodboard_projectId_project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moodboard" ADD CONSTRAINT "moodboard_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;