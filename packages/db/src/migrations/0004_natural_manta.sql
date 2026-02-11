CREATE TYPE "public"."categorie_document" AS ENUM('IDENTITE', 'MEDICAL', 'ADMINISTRATIF', 'JURIDIQUE', 'LOGEMENT', 'EMPLOI', 'AUTRE');--> statement-breakpoint
CREATE TABLE "document" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"nom" text NOT NULL,
	"categorie" "categorie_document" NOT NULL,
	"chemin_fichier" text NOT NULL,
	"type_mime" text NOT NULL,
	"taille" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "document" ADD CONSTRAINT "document_patient_id_patient_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patient"("id") ON DELETE cascade ON UPDATE no action;