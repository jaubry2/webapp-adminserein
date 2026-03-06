import { relations } from "drizzle-orm";
import {
  jsonb,
  pgEnum,
  pgTable,
  text,
  uuid,
  timestamp,
} from "drizzle-orm/pg-core";

import { professionnel } from "./professionnel";
import { patient } from "./patient";
import { particulier } from "./particulier";

export const typeDemandeEnum = pgEnum("type_demande", [
  "APA",
  "CAF_AIDE_LOGEMENT",
  "RSA",
  "AAH",
]);

export const statutDemandeEnum = pgEnum("statut_demande", [
  "BROUILLON",
  "EN_COURS",
  "EN_ATTENTE_COMPLEMENT",
  "TERMINEE",
  "ANNULEE",
]);

export const demande = pgTable("demande", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Nullable : un particulier peut faire une demande seul
  professionnelId: uuid("professionnel_id")
    .references(() => professionnel.id, { onDelete: "set null" }),

  // Nullable : l'AS peut faire une demande sans patient
  patientId: uuid("patient_id")
    .references(() => patient.id, { onDelete: "set null" }),

  // Nullable : renseigne si c'est un particulier qui fait la demande
  particulierId: uuid("particulier_id")
    .references(() => particulier.id, { onDelete: "set null" }),

  typeDemande: typeDemandeEnum("type_demande").notNull(),

  statut: statutDemandeEnum("statut").notNull().default("EN_COURS"),

  // Utile quand pas de patient lie
  nomBeneficiaire: text("nom_beneficiaire"),
  prenomBeneficiaire: text("prenom_beneficiaire"),

  details: text("details"),

  commentaireComplement: text("commentaire_complement"),
  reponseComplement: text("reponse_complement"),

  donneesFormulaire: jsonb("donnees_formulaire"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const demandeRelations = relations(demande, ({ one }) => ({
  professionnel: one(professionnel, {
    fields: [demande.professionnelId],
    references: [professionnel.id],
  }),
  patient: one(patient, {
    fields: [demande.patientId],
    references: [patient.id],
  }),
  particulier: one(particulier, {
    fields: [demande.particulierId],
    references: [particulier.id],
  }),
}));
