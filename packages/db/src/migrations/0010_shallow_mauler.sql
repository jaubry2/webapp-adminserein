CREATE TYPE "public"."statut_demande" AS ENUM('BROUILLON', 'EN_COURS', 'TERMINEE', 'ANNULEE');--> statement-breakpoint
CREATE TYPE "public"."type_demande" AS ENUM('APA', 'CAF_AIDE_LOGEMENT', 'RSA', 'AAH');--> statement-breakpoint
CREATE TABLE "demande" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"professionnel_id" uuid,
	"patient_id" uuid,
	"particulier_id" uuid,
	"type_demande" "type_demande" NOT NULL,
	"statut" "statut_demande" DEFAULT 'EN_COURS' NOT NULL,
	"nom_beneficiaire" text,
	"prenom_beneficiaire" text,
	"details" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "personne_proche" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"genre" "genre" NOT NULL,
	"nom_usage" text NOT NULL,
	"nom_naissance" text NOT NULL,
	"prenom" text NOT NULL,
	"autres_prenoms" text[],
	"adresse" text NOT NULL,
	"code_postal" text NOT NULL,
	"ville" text NOT NULL,
	"telephone" text NOT NULL,
	"mail" text NOT NULL,
	"lien" text NOT NULL,
	"ordre" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "demande" ADD CONSTRAINT "demande_professionnel_id_professionnel_id_fk" FOREIGN KEY ("professionnel_id") REFERENCES "public"."professionnel"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demande" ADD CONSTRAINT "demande_patient_id_patient_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patient"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demande" ADD CONSTRAINT "demande_particulier_id_particulier_id_fk" FOREIGN KEY ("particulier_id") REFERENCES "public"."particulier"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personne_proche" ADD CONSTRAINT "personne_proche_patient_id_patient_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patient"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "demande_acces_patient_unique_par_statut" ON "demande_acces_patient" USING btree ("patient_id","professionnel_id","statut");