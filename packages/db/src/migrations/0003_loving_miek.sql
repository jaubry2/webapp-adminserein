CREATE TYPE "public"."etat_tache" AS ENUM('A_FAIRE', 'EN_COURS', 'TERMINEE', 'ANNULEE');--> statement-breakpoint
CREATE TYPE "public"."type_demarche" AS ENUM('ADMINISTRATIVE', 'MEDICALE', 'SOCIALE', 'JURIDIQUE', 'LOGEMENT', 'EMPLOI', 'AUTRE');--> statement-breakpoint
CREATE TABLE "tache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"professionnel_id" uuid NOT NULL,
	"type_demarche" "type_demarche" NOT NULL,
	"etat" "etat_tache" DEFAULT 'A_FAIRE' NOT NULL,
	"date" timestamp NOT NULL,
	"details" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tache" ADD CONSTRAINT "tache_patient_id_patient_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patient"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tache" ADD CONSTRAINT "tache_professionnel_id_professionnel_id_fk" FOREIGN KEY ("professionnel_id") REFERENCES "public"."professionnel"("id") ON DELETE cascade ON UPDATE no action;