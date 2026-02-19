CREATE TYPE "public"."user_type" AS ENUM('PROFESSIONNEL', 'PARTICULIER');--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "type" "user_type";--> statement-breakpoint
UPDATE "user" SET "type" = 'PROFESSIONNEL' WHERE "type" IS NULL;--> statement-breakpoint
CREATE TABLE "particulier" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"patient_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "particulier_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "particulier_patient_id_unique" UNIQUE("patient_id")
);
--> statement-breakpoint
ALTER TABLE "particulier" ADD CONSTRAINT "particulier_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "particulier" ADD CONSTRAINT "particulier_patient_id_patient_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patient"("id") ON DELETE cascade ON UPDATE no action;