--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "demande_acces_patient_unique_par_statut"
  ON "demande_acces_patient" ("patient_id", "professionnel_id", "statut");
--> statement-breakpoint

