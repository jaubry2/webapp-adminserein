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
ALTER TABLE "personne_proche"
  ADD CONSTRAINT "personne_proche_patient_id_patient_id_fk"
  FOREIGN KEY ("patient_id") REFERENCES "public"."patient"("id")
  ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "personne_proche_patient_ordre_idx"
  ON "personne_proche" ("patient_id", "ordre");
--> statement-breakpoint

