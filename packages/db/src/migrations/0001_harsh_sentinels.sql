CREATE TYPE "public"."genre" AS ENUM('MASCULIN', 'FEMININ', 'AUTRE');--> statement-breakpoint
CREATE TYPE "public"."situation_familiale" AS ENUM('CELIBATAIRE', 'MARIE', 'DIVORCE', 'VEUF', 'PACSE', 'CONCUBINAGE');--> statement-breakpoint
CREATE TABLE "information_identite" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nom_usage" text NOT NULL,
	"nom_naissance" text NOT NULL,
	"prenom" text NOT NULL,
	"autres_prenoms" text[],
	"genre" "genre" NOT NULL,
	"date_naissance" date NOT NULL,
	"ville_naissance" text NOT NULL,
	"departement_naissance" text NOT NULL,
	"pays_naissance" text NOT NULL,
	"nationalites" text[],
	"numero_securite_sociale" text NOT NULL,
	"situation_familiale" "situation_familiale" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patient" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"numero_dossier" text NOT NULL,
	"information_identite_id" uuid NOT NULL,
	CONSTRAINT "patient_numero_dossier_unique" UNIQUE("numero_dossier"),
	CONSTRAINT "patient_information_identite_id_unique" UNIQUE("information_identite_id")
);
--> statement-breakpoint
ALTER TABLE "patient" ADD CONSTRAINT "patient_information_identite_id_information_identite_id_fk" FOREIGN KEY ("information_identite_id") REFERENCES "public"."information_identite"("id") ON DELETE restrict ON UPDATE no action;