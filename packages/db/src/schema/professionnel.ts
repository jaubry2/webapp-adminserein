import { relations } from "drizzle-orm";
import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth";
import { patient } from "./patient";

// Table Professionnel : lie un utilisateur à un profil professionnel
export const professionnel = pgTable("professionnel", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Lien vers le compte utilisateur (1-1)
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" })
    .unique(),

  // Informations professionnelles
  nom: text("nom").notNull(),
  prenom: text("prenom").notNull(),
  fonction: text("fonction").notNull(), // ex: "Assistante sociale", "Éducateur", etc.

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Table de liaison Patient-Professionnel (many-to-many)
// Un professionnel peut suivre plusieurs patients, un patient peut être suivi par plusieurs professionnels
export const patientProfessionnel = pgTable("patient_professionnel", {
  id: uuid("id").defaultRandom().primaryKey(),

  patientId: uuid("patient_id")
    .notNull()
    .references(() => patient.id, { onDelete: "cascade" }),

  professionnelId: uuid("professionnel_id")
    .notNull()
    .references(() => professionnel.id, { onDelete: "cascade" }),

  // Date d'attribution du patient au professionnel
  dateAttribution: timestamp("date_attribution").defaultNow().notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations Drizzle
export const professionnelRelations = relations(professionnel, ({ one, many }) => ({
  user: one(user, {
    fields: [professionnel.userId],
    references: [user.id],
  }),
  patients: many(patientProfessionnel),
}));

export const patientProfessionnelRelations = relations(
  patientProfessionnel,
  ({ one }) => ({
    patient: one(patient, {
      fields: [patientProfessionnel.patientId],
      references: [patient.id],
    }),
    professionnel: one(professionnel, {
      fields: [patientProfessionnel.professionnelId],
      references: [professionnel.id],
    }),
  })
);

