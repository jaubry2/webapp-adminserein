import { relations } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  text,
  uuid,
  timestamp,
} from "drizzle-orm/pg-core";

import { patient } from "./patient";
import { professionnel } from "./professionnel";

// Enum pour le type de démarche
export const typeDemarcheEnum = pgEnum("type_demarche", [
  "ADMINISTRATIVE",
  "MEDICALE",
  "SOCIALE",
  "JURIDIQUE",
  "LOGEMENT",
  "EMPLOI",
  "AUTRE",
]);

// Enum pour l'état de la tâche
export const etatTacheEnum = pgEnum("etat_tache", [
  "A_FAIRE",
  "EN_COURS",
  "TERMINEE",
  "ANNULEE",
]);

// Table Tâche
export const tache = pgTable("tache", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Lien vers le patient
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patient.id, { onDelete: "cascade" }),

  // Lien vers le professionnel (assistante sociale)
  professionnelId: uuid("professionnel_id")
    .notNull()
    .references(() => professionnel.id, { onDelete: "cascade" }),

  // Type de démarche
  typeDemarche: typeDemarcheEnum("type_demarche").notNull(),

  // État de la tâche
  etat: etatTacheEnum("etat").notNull().default("A_FAIRE"),

  // Date de la tâche
  date: timestamp("date").notNull(),

  // Détails de la tâche
  details: text("details").notNull(),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Relations Drizzle
export const tacheRelations = relations(tache, ({ one }) => ({
  patient: one(patient, {
    fields: [tache.patientId],
    references: [patient.id],
  }),
  professionnel: one(professionnel, {
    fields: [tache.professionnelId],
    references: [professionnel.id],
  }),
}));
