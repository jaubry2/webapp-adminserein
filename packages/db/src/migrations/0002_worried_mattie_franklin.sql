CREATE TABLE "information_coordonnee" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"adresse" text NOT NULL,
	"information_complementaires" text,
	"code_postal" text NOT NULL,
	"ville" text NOT NULL,
	"departement" text NOT NULL,
	"pays" text NOT NULL,
	"numero_telephone" text NOT NULL,
	"adresse_mail" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patient_professionnel" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"professionnel_id" uuid NOT NULL,
	"date_attribution" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "professionnel" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"nom" text NOT NULL,
	"prenom" text NOT NULL,
	"fonction" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "professionnel_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "information_coordonnee_id" uuid;--> statement-breakpoint
-- Créer des coordonnées par défaut pour les patients existants
DO $$
DECLARE
    patient_record RECORD;
    coordonnee_id uuid;
BEGIN
    FOR patient_record IN SELECT id FROM "patient" WHERE "information_coordonnee_id" IS NULL LOOP
        INSERT INTO "information_coordonnee" (
            "adresse",
            "code_postal",
            "ville",
            "departement",
            "pays",
            "numero_telephone",
            "adresse_mail"
        ) VALUES (
            'Adresse non renseignée',
            '00000',
            'Ville non renseignée',
            '00',
            'France',
            '0000000000',
            'email@non-renseigne.fr'
        ) RETURNING id INTO coordonnee_id;
        
        UPDATE "patient" 
        SET "information_coordonnee_id" = coordonnee_id 
        WHERE id = patient_record.id;
    END LOOP;
END $$;
--> statement-breakpoint
ALTER TABLE "patient" ALTER COLUMN "information_coordonnee_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "patient_professionnel" ADD CONSTRAINT "patient_professionnel_patient_id_patient_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patient"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_professionnel" ADD CONSTRAINT "patient_professionnel_professionnel_id_professionnel_id_fk" FOREIGN KEY ("professionnel_id") REFERENCES "public"."professionnel"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professionnel" ADD CONSTRAINT "professionnel_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient" ADD CONSTRAINT "patient_information_coordonnee_id_information_coordonnee_id_fk" FOREIGN KEY ("information_coordonnee_id") REFERENCES "public"."information_coordonnee"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient" ADD CONSTRAINT "patient_information_coordonnee_id_unique" UNIQUE("information_coordonnee_id");