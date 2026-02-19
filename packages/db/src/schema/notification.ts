import { relations } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  text,
  uuid,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

import { patient } from "./patient";
import { professionnel } from "./professionnel";

// Enum pour les types de notifications
export const typeNotificationEnum = pgEnum("type_notification", [
  "INFO",
  "WARNING",
  "ERROR",
  "SUCCESS",
]);

// Table Notification : notifications liées à un professionnel ou un patient
export const notification = pgTable("notification", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Lien vers le professionnel (nullable, une notification est soit pour un professionnel soit pour un patient)
  professionnelId: uuid("professionnel_id")
    .references(() => professionnel.id, { onDelete: "cascade" }),

  // Lien vers le patient (nullable)
  patientId: uuid("patient_id")
    .references(() => patient.id, { onDelete: "cascade" }),

  // Type de notification
  type: typeNotificationEnum("type").notNull(),

  // Contenu de la notification
  titre: text("titre").notNull(),
  message: text("message").notNull(),

  // État de lecture
  lue: boolean("lue").notNull().default(false),

  // Lien optionnel pour rediriger
  lien: text("lien"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Relations Drizzle
export const notificationRelations = relations(notification, ({ one }) => ({
  professionnel: one(professionnel, {
    fields: [notification.professionnelId],
    references: [professionnel.id],
  }),
  patient: one(patient, {
    fields: [notification.patientId],
    references: [patient.id],
  }),
}));
