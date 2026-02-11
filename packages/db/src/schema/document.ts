import { relations } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  text,
  uuid,
  timestamp,
} from "drizzle-orm/pg-core";

import { patient } from "./patient";

// Enum pour les catégories de documents
export const categorieDocumentEnum = pgEnum("categorie_document", [
  "IDENTITE",
  "MEDICAL",
  "ADMINISTRATIF",
  "JURIDIQUE",
  "LOGEMENT",
  "EMPLOI",
  "AUTRE",
]);

// Table Document : documents liés à un patient
export const document = pgTable("document", {
  id: uuid("id").defaultRandom().primaryKey(),
  
  // Lien vers le patient
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patient.id, { onDelete: "cascade" }),

  // Informations du document
  nom: text("nom").notNull(),
  categorie: categorieDocumentEnum("categorie").notNull(),
  
  // Chemin/URL du fichier (stockage local ou URL externe)
  cheminFichier: text("chemin_fichier").notNull(),
  
  // Type MIME du fichier (ex: "application/pdf", "image/jpeg")
  typeMime: text("type_mime").notNull(),
  
  // Taille du fichier en octets
  taille: text("taille").notNull(),
  
  // Description optionnelle
  description: text("description"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Relations Drizzle
export const documentRelations = relations(document, ({ one }) => ({
  patient: one(patient, {
    fields: [document.patientId],
    references: [patient.id],
  }),
}));
