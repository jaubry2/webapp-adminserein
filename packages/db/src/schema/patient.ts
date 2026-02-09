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

// Informations de coordonnées du patient
export const informationCoordonnee = pgTable("information_coordonnee", {
  id: uuid("id").defaultRandom().primaryKey(),

  adresse: text("adresse").notNull(),
  informationComplementaires: text("information_complementaires"),
  codePostal: text("code_postal").notNull(),
  ville: text("ville").notNull(),
  departement: text("departement").notNull(),
  pays: text("pays").notNull(),
  numeroTelephone: text("numero_telephone").notNull(),
  adresseMail: text("adresse_mail").notNull(),
});

// Table Patient avec lien 1–1 vers information_identite et information_coordonnee
export const patient = pgTable("patient", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Numéro de dossier métier
  numeroDossier: text("numero_dossier").notNull().unique(),

  // Lien vers les informations d'identité
  informationIdentiteId: uuid("information_identite_id")
    .notNull()
    .references(() => informationIdentite.id, { onDelete: "restrict" })
    .unique(),

  // Lien vers les informations de coordonnées
  informationCoordonneeId: uuid("information_coordonnee_id")
    .notNull()
    .references(() => informationCoordonnee.id, { onDelete: "restrict" })
    .unique(),
});

// Relations Drizzle
export const patientRelations = relations(patient, ({ one, many }) => ({
  informationIdentite: one(informationIdentite, {
    fields: [patient.informationIdentiteId],
    references: [informationIdentite.id],
  }),
  informationCoordonnee: one(informationCoordonnee, {
    fields: [patient.informationCoordonneeId],
    references: [informationCoordonnee.id],
  }),
  // Note: La relation many-to-many avec professionnel est définie dans professionnel.ts
  // pour éviter les dépendances circulaires
  // La relation avec tâche est définie dans tache.ts pour éviter les dépendances circulaires
}));

export const informationIdentiteRelations = relations(
  informationIdentite,
  ({ one }) => ({
    patient: one(patient, {
      fields: [informationIdentite.id],
      references: [patient.informationIdentiteId],
    }),
  })
);

export const informationCoordonneeRelations = relations(
  informationCoordonnee,
  ({ one }) => ({
    patient: one(patient, {
      fields: [informationCoordonnee.id],
      references: [patient.informationCoordonneeId],
    }),
  })
);

