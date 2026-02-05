import type { RouterClient } from "@orpc/server";
import { eq, and, inArray } from "drizzle-orm";
import { z } from "zod";

import {
  db,
  informationIdentite,
  patient,
  professionnel,
  patientProfessionnel,
} from "@webapp-adminserein/db";
import { protectedProcedure, publicProcedure } from "../index";

// Schémas Zod pour (dé)sérialiser les données côté API
const informationIdentiteInputSchema = z.object({
  nomUsage: z.string(),
  nomNaissance: z.string(),
  prenom: z.string(),
  autresPrenoms: z.array(z.string()).optional().default([]),
  genre: z.enum(["MASCULIN", "FEMININ", "AUTRE"]),
  dateNaissance: z.string(), // format ISO (YYYY-MM-DD)
  villeNaissance: z.string(),
  departementNaissance: z.string(),
  paysNaissance: z.string(),
  nationalites: z.array(z.string()).optional().default([]),
  numeroSecuriteSociale: z.string(),
  situationFamiliale: z.enum([
    "CELIBATAIRE",
    "MARIE",
    "DIVORCE",
    "VEUF",
    "PACSE",
    "CONCUBINAGE",
  ]),
});

const patientCreateInputSchema = z.object({
  numeroDossier: z.string(),
  informationIdentite: informationIdentiteInputSchema,
});

const patientUpdateInputSchema = z.object({
  patientId: z.string().uuid(),
  // Champs optionnels : on ne met à jour que ceux présents
  numeroDossier: z.string().optional(),
  informationIdentite: informationIdentiteInputSchema.partial().optional(),
});

export const appRouter = {
  // Santé de l'API
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),

  // Exemple de route protégée existante
  privateData: protectedProcedure.handler(({ context }) => {
    return {
      message: "This is private",
      user: context.session?.user,
    };
  }),

  // --- PATIENTS ---

  // Créer un patient avec ses informations d'identité et le lier au professionnel connecté
  createPatient: protectedProcedure
    .input(patientCreateInputSchema)
    .handler(async ({ input, context }) => {
      if (!context.session?.user?.id) {
        throw new Error("Non authentifié");
      }

      // Récupérer le professionnel lié à l'utilisateur
      const [prof] = await db
        .select()
        .from(professionnel)
        .where(eq(professionnel.userId, context.session.user.id))
        .limit(1);

      if (!prof) {
        throw new Error("Aucun professionnel associé à ce compte");
      }

      const { numeroDossier, informationIdentite: info } = input;

      const [createdInfo] = await db
        .insert(informationIdentite)
        .values({
          nomUsage: info.nomUsage,
          nomNaissance: info.nomNaissance,
          prenom: info.prenom,
          autresPrenoms: info.autresPrenoms,
          genre: info.genre,
          dateNaissance: new Date(info.dateNaissance),
          villeNaissance: info.villeNaissance,
          departementNaissance: info.departementNaissance,
          paysNaissance: info.paysNaissance,
          nationalites: info.nationalites,
          numeroSecuriteSociale: info.numeroSecuriteSociale,
          situationFamiliale: info.situationFamiliale,
        })
        .returning();

      const [createdPatient] = await db
        .insert(patient)
        .values({
          numeroDossier,
          informationIdentiteId: createdInfo.id,
        })
        .returning();

      // Lier automatiquement le patient au professionnel connecté
      await db.insert(patientProfessionnel).values({
        patientId: createdPatient.id,
        professionnelId: prof.id,
      });

      return {
        ...createdPatient,
        informationIdentite: createdInfo,
      };
    }),

  // Mettre à jour un patient et/ou ses informations d'identité
  updatePatient: protectedProcedure
    .input(patientUpdateInputSchema)
    .handler(async ({ input }) => {
      const { patientId, numeroDossier, informationIdentite: info } = input;

      const [existing] = await db
        .select()
        .from(patient)
        .where(eq(patient.id, patientId));

      if (!existing) {
        throw new Error("Patient non trouvé");
      }

      if (numeroDossier) {
        await db
          .update(patient)
          .set({ numeroDossier })
          .where(eq(patient.id, patientId));
      }

      if (info && Object.keys(info).length > 0) {
        await db
          .update(informationIdentite)
          .set({
            ...(info.nomUsage && { nomUsage: info.nomUsage }),
            ...(info.nomNaissance && { nomNaissance: info.nomNaissance }),
            ...(info.prenom && { prenom: info.prenom }),
            ...(info.autresPrenoms && { autresPrenoms: info.autresPrenoms }),
            ...(info.genre && { genre: info.genre }),
            ...(info.dateNaissance && {
              dateNaissance: new Date(info.dateNaissance),
            }),
            ...(info.villeNaissance && {
              villeNaissance: info.villeNaissance,
            }),
            ...(info.departementNaissance && {
              departementNaissance: info.departementNaissance,
            }),
            ...(info.paysNaissance && { paysNaissance: info.paysNaissance }),
            ...(info.nationalites && { nationalites: info.nationalites }),
            ...(info.numeroSecuriteSociale && {
              numeroSecuriteSociale: info.numeroSecuriteSociale,
            }),
            ...(info.situationFamiliale && {
              situationFamiliale: info.situationFamiliale,
            }),
          })
          .where(eq(informationIdentite.id, existing.informationIdentiteId));
      }

      const [updatedPatient] = await db
        .select()
        .from(patient)
        .where(eq(patient.id, patientId));

      const [updatedInfo] = await db
        .select()
        .from(informationIdentite)
        .where(eq(informationIdentite.id, updatedPatient.informationIdentiteId));

      return {
        ...updatedPatient,
        informationIdentite: updatedInfo,
      };
    }),

  // Récupérer un patient par son ID (filtré selon le professionnel connecté)
  getPatientById: protectedProcedure
    .input(z.object({ patientId: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      if (!context.session?.user?.id) {
        throw new Error("Non authentifié");
      }

      // Récupérer le professionnel lié à l'utilisateur
      const [prof] = await db
        .select()
        .from(professionnel)
        .where(eq(professionnel.userId, context.session.user.id))
        .limit(1);

      if (!prof) {
        throw new Error("Aucun professionnel associé à ce compte");
      }

      // Vérifier que le patient appartient au professionnel
      const [patientLink] = await db
        .select()
        .from(patientProfessionnel)
        .where(
          and(
            eq(patientProfessionnel.patientId, input.patientId),
            eq(patientProfessionnel.professionnelId, prof.id)
          )
        )
        .limit(1);

      if (!patientLink) {
        throw new Error("Patient non trouvé ou non autorisé");
      }

      const [p] = await db
        .select()
        .from(patient)
        .where(eq(patient.id, input.patientId));

      if (!p) {
        throw new Error("Patient non trouvé");
      }

      const [info] = await db
        .select()
        .from(informationIdentite)
        .where(eq(informationIdentite.id, p.informationIdentiteId));

      return {
        ...p,
        informationIdentite: info,
      };
    }),

  // Lister tous les patients suivis par le professionnel connecté
  listPatients: protectedProcedure.handler(async ({ context }) => {
    if (!context.session?.user?.id) {
      throw new Error("Non authentifié");
    }

    // Récupérer le professionnel lié à l'utilisateur
    const [prof] = await db
      .select()
      .from(professionnel)
      .where(eq(professionnel.userId, context.session.user.id))
      .limit(1);

    if (!prof) {
      throw new Error("Aucun professionnel associé à ce compte");
    }

    // Récupérer les IDs des patients suivis par ce professionnel
    const patientLinks = await db
      .select({ patientId: patientProfessionnel.patientId })
      .from(patientProfessionnel)
      .where(eq(patientProfessionnel.professionnelId, prof.id));

    const patientIds = patientLinks.map((link) => link.patientId);

    if (patientIds.length === 0) {
      return [];
    }

    // Récupérer les patients et leurs informations d'identité
    const patients = await db
      .select()
      .from(patient)
      .where(inArray(patient.id, patientIds));

    const infos = await db.select().from(informationIdentite);
    const infoById = new Map(infos.map((i) => [i.id, i]));

    return patients.map((p) => ({
      ...p,
      informationIdentite: infoById.get(p.informationIdentiteId),
    }));
  }),
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
