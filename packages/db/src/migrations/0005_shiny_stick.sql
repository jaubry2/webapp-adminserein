CREATE TYPE "public"."type_notification" AS ENUM('INFO', 'WARNING', 'ERROR', 'SUCCESS');--> statement-breakpoint
CREATE TABLE "notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"professionnel_id" uuid,
	"patient_id" uuid,
	"type" "type_notification" NOT NULL,
	"titre" text NOT NULL,
	"message" text NOT NULL,
	"lue" boolean DEFAULT false NOT NULL,
	"lien" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_professionnel_id_professionnel_id_fk" FOREIGN KEY ("professionnel_id") REFERENCES "public"."professionnel"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_patient_id_patient_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patient"("id") ON DELETE cascade ON UPDATE no action;