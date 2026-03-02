CREATE TYPE "public"."demande_acces_statut" AS ENUM('EN_ATTENTE', 'ACCEPTEE', 'REFUSEE');--> statement-breakpoint
CREATE TABLE "demande_acces_patient" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"professionnel_id" uuid NOT NULL,
	"statut" "demande_acces_statut" DEFAULT 'EN_ATTENTE' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "demande_acces_patient" ADD CONSTRAINT "demande_acces_patient_patient_id_patient_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patient"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demande_acces_patient" ADD CONSTRAINT "demande_acces_patient_professionnel_id_professionnel_id_fk" FOREIGN KEY ("professionnel_id") REFERENCES "public"."professionnel"("id") ON DELETE cascade ON UPDATE no action;