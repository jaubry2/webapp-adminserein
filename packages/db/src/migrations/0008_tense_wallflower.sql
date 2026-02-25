CREATE TABLE "information_conjoint" (
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
	"numero_securite_sociale" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "information_conjoint_id" uuid;--> statement-breakpoint
ALTER TABLE "patient" ADD CONSTRAINT "patient_information_conjoint_id_information_conjoint_id_fk" FOREIGN KEY ("information_conjoint_id") REFERENCES "public"."information_conjoint"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient" ADD CONSTRAINT "patient_information_conjoint_id_unique" UNIQUE("information_conjoint_id");