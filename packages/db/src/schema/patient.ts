import { relations } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  text,
  uuid,
  date,
} from "drizzle-orm/pg-core";

// Enums pour les valeurs structurées
export const genreEnum = pgEnum("genre", [
  "MASCULIN",
  "FEMININ",
  "AUTRE",
]);

export const situationFamilialeEnum = pgEnum("situation_familiale", [
  "CELIBATAIRE",
  "MARIE",
  "DIVORCE",
  "VEUF",
  "PACSE",
  "CONCUBINAGE",
]);

// Informations d'identité du patient
export const informationIdentite = pgTable("information_identite", {
  id: uuid("id").defaultRandom().primaryKey(),

  nomUsage: text("nom_usage").notNull(),
  nomNaissance: text("nom_naissance").notNull(),
  prenom: text("prenom").notNull(),

  // Autres prénoms éventuels
  autresPrenoms: text("autres_prenoms").array(),

  genre: genreEnum("genre").notNull(),

  dateNaissance: date("date_naissance").notNull(),
  villeNaissance: text("ville_naissance").notNull(),
  departementNaissance: text("departement_naissance").notNull(),
  paysNaissance: text("pays_naissance").notNull(),

  // Nationalités multiples possibles
  nationalites: text("nationalites").array(),

  numeroSecuriteSociale: text("numero_securite_sociale").notNull(),

  situationFamiliale: situationFamilialeEnum("situation_familiale").notNull(),
});

// Table Patient avec lien 1–1 vers information_identite
export const patient = pgTable("patient", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Numéro de dossier métier
  numeroDossier: text("numero_dossier").notNull().unique(),

  // Lien vers les informations d'identité
  informationIdentiteId: uuid("information_identite_id")
    .notNull()
    .references(() => informationIdentite.id, { onDelete: "restrict" })
    .unique(),
});

// Relations Drizzle
export const patientRelations = relations(patient, ({ one, many }) => ({
  informationIdentite: one(informationIdentite, {
    fields: [patient.informationIdentiteId],
    references: [informationIdentite.id],
  }),
  professionnels: many("patientProfessionnel"),
}));

export const informationIdentiteRelations = relations(
  informationIdentite,
  ({ many }) => ({
    patients: many(patient),
  }),
);

