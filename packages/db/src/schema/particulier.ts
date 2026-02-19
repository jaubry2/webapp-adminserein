import { relations } from "drizzle-orm";
import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth";
import { patient } from "./patient";

// Table Particulier : lie un utilisateur à un patient
export const particulier = pgTable("particulier", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Lien vers le compte utilisateur (1-1)
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" })
    .unique(),

  // Lien vers le patient (1-1)
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patient.id, { onDelete: "cascade" })
    .unique(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Relations Drizzle
export const particulierRelations = relations(particulier, ({ one }) => ({
  user: one(user, {
    fields: [particulier.userId],
    references: [user.id],
  }),
  patient: one(patient, {
    fields: [particulier.patientId],
    references: [patient.id],
  }),
}));
