import type { RouterClient } from "@orpc/server";
import { eq, and, inArray, or, desc } from "drizzle-orm";
import { z } from "zod";

import {
  db,
  informationIdentite,
  informationCoordonnee,
  patient,
  professionnel,
  particulier,
  patientProfessionnel,
  tache,
  document,
  notification,
  user,
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

const informationCoordonneeInputSchema = z.object({
  adresse: z.string(),
  informationComplementaires: z.string().optional(),
  codePostal: z.string(),
  ville: z.string(),
  departement: z.string(),
  pays: z.string(),
  numeroTelephone: z.string(),
  adresseMail: z.string(),
});

const patientCreateInputSchema = z.object({
  numeroDossier: z.string(),
  informationIdentite: informationIdentiteInputSchema,
  informationCoordonnee: informationCoordonneeInputSchema,
});

const patientUpdateInputSchema = z.object({
  patientId: z.string().uuid(),
  // Champs optionnels : on ne met à jour que ceux présents
  numeroDossier: z.string().optional(),
  informationIdentite: informationIdentiteInputSchema.partial().optional(),
  informationCoordonnee: informationCoordonneeInputSchema.partial().optional(),
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

      const {
        numeroDossier,
        informationIdentite: info,
        informationCoordonnee: coord,
      } = input;

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

      const [createdCoordonnee] = await db
        .insert(informationCoordonnee)
        .values({
          adresse: coord.adresse,
          informationComplementaires: coord.informationComplementaires,
          codePostal: coord.codePostal,
          ville: coord.ville,
          departement: coord.departement,
          pays: coord.pays,
          numeroTelephone: coord.numeroTelephone,
          adresseMail: coord.adresseMail,
        })
        .returning();

      const [createdPatient] = await db
        .insert(patient)
        .values({
          numeroDossier,
          informationIdentiteId: createdInfo.id,
          informationCoordonneeId: createdCoordonnee.id,
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
        informationCoordonnee: createdCoordonnee,
      };
    }),

  // Mettre à jour un patient et/ou ses informations d'identité et coordonnées
  updatePatient: protectedProcedure
    .input(patientUpdateInputSchema)
    .handler(async ({ input }) => {
      const {
        patientId,
        numeroDossier,
        informationIdentite: info,
        informationCoordonnee: coord,
      } = input;

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

      if (coord && Object.keys(coord).length > 0) {
        await db
          .update(informationCoordonnee)
          .set({
            ...(coord.adresse && { adresse: coord.adresse }),
            ...(coord.informationComplementaires !== undefined && {
              informationComplementaires: coord.informationComplementaires,
            }),
            ...(coord.codePostal && { codePostal: coord.codePostal }),
            ...(coord.ville && { ville: coord.ville }),
            ...(coord.departement && { departement: coord.departement }),
            ...(coord.pays && { pays: coord.pays }),
            ...(coord.numeroTelephone && {
              numeroTelephone: coord.numeroTelephone,
            }),
            ...(coord.adresseMail && { adresseMail: coord.adresseMail }),
          })
          .where(
            eq(informationCoordonnee.id, existing.informationCoordonneeId)
          );
      }

      const [updatedPatient] = await db
        .select()
        .from(patient)
        .where(eq(patient.id, patientId));

      const [updatedInfo] = await db
        .select()
        .from(informationIdentite)
        .where(eq(informationIdentite.id, updatedPatient.informationIdentiteId));

      const [updatedCoordonnee] = await db
        .select()
        .from(informationCoordonnee)
        .where(
          eq(informationCoordonnee.id, updatedPatient.informationCoordonneeId)
        );

      return {
        ...updatedPatient,
        informationIdentite: updatedInfo,
        informationCoordonnee: updatedCoordonnee,
      };
    }),

  // Récupérer un patient par son ID (filtré selon le type d'utilisateur)
  getPatientById: protectedProcedure
    .input(z.object({ patientId: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      if (!context.session?.user?.id) {
        throw new Error("Non authentifié");
      }

      // Récupérer le type d'utilisateur
      const [userData] = await db
        .select()
        .from(user)
        .where(eq(user.id, context.session.user.id))
        .limit(1);

      if (!userData) {
        throw new Error("Utilisateur non trouvé");
      }

      // Vérification selon le type d'utilisateur
      if (userData.type === "PROFESSIONNEL") {
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
      } else if (userData.type === "PARTICULIER") {
        // Récupérer le particulier lié à l'utilisateur
        const [part] = await db
          .select()
          .from(particulier)
          .where(eq(particulier.userId, context.session.user.id))
          .limit(1);

        if (!part) {
          throw new Error("Aucun particulier associé à ce compte");
        }

        // Vérifier que le patient correspond au particulier
        if (part.patientId !== input.patientId) {
          throw new Error("Patient non autorisé");
        }
      } else {
        throw new Error("Type d'utilisateur non reconnu");
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

      const [coordonnee] = await db
        .select()
        .from(informationCoordonnee)
        .where(eq(informationCoordonnee.id, p.informationCoordonneeId));

      return {
        ...p,
        informationIdentite: info,
        informationCoordonnee: coordonnee,
      };
    }),

  // Ajouter un patient existant à la liste du professionnel connecté
  addPatientToProfessional: protectedProcedure
    .input(
      z.object({
        numeroDossier: z.string(),
      })
    )
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

      // Trouver le patient par son numéro de dossier
      const [existingPatient] = await db
        .select()
        .from(patient)
        .where(eq(patient.numeroDossier, input.numeroDossier))
        .limit(1);

      if (!existingPatient) {
        throw new Error("Patient non trouvé avec ce numéro de dossier");
      }

      // Vérifier si le patient n'est pas déjà lié à ce professionnel
      const [existingLink] = await db
        .select()
        .from(patientProfessionnel)
        .where(
          and(
            eq(patientProfessionnel.patientId, existingPatient.id),
            eq(patientProfessionnel.professionnelId, prof.id)
          )
        )
        .limit(1);

      if (existingLink) {
        throw new Error("Ce patient est déjà dans votre liste");
      }

      // Créer le lien patient-professionnel
      await db.insert(patientProfessionnel).values({
        patientId: existingPatient.id,
        professionnelId: prof.id,
      });

      // Récupérer les informations d'identité pour le retour
      const [info] = await db
        .select()
        .from(informationIdentite)
        .where(eq(informationIdentite.id, existingPatient.informationIdentiteId))
        .limit(1);

      return {
        ...existingPatient,
        informationIdentite: info,
      };
    }),

  // Rechercher un patient par ses informations uniques
  searchPatientByInfo: protectedProcedure
    .input(
      z.object({
        dateNaissance: z.string(), // format ISO YYYY-MM-DD
        prenom: z.string(),
        nom: z.string(), // nomUsage ou nomNaissance
        numeroSecuriteSociale: z.string(),
      })
    )
    .handler(async ({ input }) => {
      // Rechercher dans informationIdentite avec les critères
      // Le nom peut être soit nomUsage soit nomNaissance
      const matchingInfos = await db
        .select()
        .from(informationIdentite)
        .where(
          and(
            eq(informationIdentite.dateNaissance, input.dateNaissance),
            eq(informationIdentite.prenom, input.prenom),
            or(
              eq(informationIdentite.nomUsage, input.nom),
              eq(informationIdentite.nomNaissance, input.nom)
            ),
            eq(informationIdentite.numeroSecuriteSociale, input.numeroSecuriteSociale)
          )
        );

      if (matchingInfos.length === 0) {
        return [];
      }

      // Récupérer les patients associés à ces informations d'identité
      const infoIds = matchingInfos.map((info) => info.id);
      const patients = await db
        .select()
        .from(patient)
        .where(inArray(patient.informationIdentiteId, infoIds));

      // Créer un map pour associer les informations aux patients
      const infoById = new Map(matchingInfos.map((i) => [i.id, i]));

      return patients.map((p) => ({
        ...p,
        informationIdentite: infoById.get(p.informationIdentiteId),
      }));
    }),

  // Retirer un patient de la liste du professionnel connecté
  removePatientFromProfessional: protectedProcedure
    .input(
      z.object({
        patientId: z.string(),
      })
    )
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

      // Vérifier que le lien existe
      const [existingLink] = await db
        .select()
        .from(patientProfessionnel)
        .where(
          and(
            eq(patientProfessionnel.patientId, input.patientId),
            eq(patientProfessionnel.professionnelId, prof.id)
          )
        )
        .limit(1);

      if (!existingLink) {
        throw new Error("Ce patient n'est pas dans votre liste");
      }

      // Vérifier s'il y a des tâches non terminées pour ce patient et ce professionnel
      const tachesNonTerminees = await db
        .select()
        .from(tache)
        .where(
          and(
            eq(tache.patientId, input.patientId),
            eq(tache.professionnelId, prof.id),
            or(
              eq(tache.etat, "A_FAIRE"),
              eq(tache.etat, "EN_COURS")
            )
          )
        );

      const nombreTachesNonTerminees = tachesNonTerminees.length;

      // Supprimer toutes les tâches liées à ce patient et ce professionnel
      await db
        .delete(tache)
        .where(
          and(
            eq(tache.patientId, input.patientId),
            eq(tache.professionnelId, prof.id)
          )
        );

      // Supprimer le lien patient-professionnel
      await db
        .delete(patientProfessionnel)
        .where(
          and(
            eq(patientProfessionnel.patientId, input.patientId),
            eq(patientProfessionnel.professionnelId, prof.id)
          )
        );

      // Récupérer les informations du patient pour la notification
      const [patientInfo] = await db
        .select()
        .from(patient)
        .where(eq(patient.id, input.patientId))
        .limit(1);

      let patientNom = "Ce patient";
      if (patientInfo) {
        const [info] = await db
          .select()
          .from(informationIdentite)
          .where(eq(informationIdentite.id, patientInfo.informationIdentiteId))
          .limit(1);
        if (info) {
          patientNom = `${info.prenom} ${info.nomUsage}`;
        }
      }

      // Créer une notification pour le professionnel
      const messageNotification = nombreTachesNonTerminees > 0
        ? `Le patient ${patientNom} a été retiré de votre liste. ${nombreTachesNonTerminees} tâche(s) non terminée(s) ${nombreTachesNonTerminees > 1 ? "ont été" : "a été"} supprimée(s).`
        : `Le patient ${patientNom} a été retiré de votre liste.`;

      await db.insert(notification).values({
        professionnelId: prof.id,
        type: nombreTachesNonTerminees > 0 ? "WARNING" : "INFO",
        titre: "Patient retiré",
        message: messageNotification,
        lien: null, // Le patient n'est plus accessible, donc pas de lien
      });

      return {
        success: true,
        notification: nombreTachesNonTerminees > 0
          ? {
              type: "warning" as const,
              message: messageNotification,
              nombreTachesSupprimees: nombreTachesNonTerminees,
            }
          : null,
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

    // Récupérer les patients et leurs informations d'identité et coordonnées
    const patients = await db
      .select()
      .from(patient)
      .where(inArray(patient.id, patientIds));

    const infos = await db.select().from(informationIdentite);
    const infoById = new Map(infos.map((i) => [i.id, i]));

    const coordonnees = await db.select().from(informationCoordonnee);
    const coordonneeById = new Map(coordonnees.map((c) => [c.id, c]));

    return patients.map((p) => ({
      ...p,
      informationIdentite: infoById.get(p.informationIdentiteId),
      informationCoordonnee: coordonneeById.get(p.informationCoordonneeId),
    }));
  }),

  // Récupérer les tâches du professionnel connecté
  listTachesByProfessionnel: protectedProcedure.handler(
    async ({ context }) => {
      if (!context.session?.user?.id) {
        throw new Error("Non authentifié");
      }

      // Vérifier que l'utilisateur est un professionnel
      const [userData] = await db
        .select()
        .from(user)
        .where(eq(user.id, context.session.user.id))
        .limit(1);

      if (!userData || userData.type !== "PROFESSIONNEL") {
        throw new Error("Cet utilisateur n'est pas un professionnel");
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

      // Récupérer les tâches du professionnel
      const taches = await db
        .select()
        .from(tache)
        .where(eq(tache.professionnelId, prof.id))
        .orderBy(desc(tache.date));

      // Récupérer les patients associés
      const patientIds = [...new Set(taches.map((t) => t.patientId))];
      const patients = await db
        .select()
        .from(patient)
        .where(inArray(patient.id, patientIds));

      const infos = await db
        .select()
        .from(informationIdentite)
        .where(
          inArray(
            informationIdentite.id,
            patients.map((p) => p.informationIdentiteId)
          )
        );
      const infoById = new Map(infos.map((i) => [i.id, i]));

      // Construire la réponse avec les informations du patient
      return taches.map((t) => {
        const p = patients.find((pat) => pat.id === t.patientId);
        const info = p ? infoById.get(p.informationIdentiteId) : null;
        return {
          ...t,
          patient: p
            ? {
                ...p,
                informationIdentite: info,
              }
            : null,
          professionnel: prof,
        };
      });
    }
  ),

  // Récupérer les tâches d'un patient spécifique
  listTachesByPatient: protectedProcedure
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

      // Récupérer les tâches du patient
      const taches = await db
        .select()
        .from(tache)
        .where(eq(tache.patientId, input.patientId))
        .orderBy(desc(tache.date));

      // Récupérer les professionnels associés
      const professionnelIds = [
        ...new Set(taches.map((t) => t.professionnelId)),
      ];
      const professionnels = await db
        .select()
        .from(professionnel)
        .where(inArray(professionnel.id, professionnelIds));
      const profById = new Map(
        professionnels.map((p) => [p.id, p])
      );

      // Construire la réponse avec les informations du professionnel
      return taches.map((t) => ({
        ...t,
        professionnel: profById.get(t.professionnelId) || null,
      }));
    }),

  // Récupérer le type d'utilisateur connecté
  getUserType: protectedProcedure.handler(async ({ context }) => {
    if (!context.session?.user?.id) {
      return { type: null };
    }

    const [userData] = await db
      .select()
      .from(user)
      .where(eq(user.id, context.session.user.id))
      .limit(1);

    return { type: userData?.type || null };
  }),

  // Récupérer le professionnel connecté
  getCurrentProfessionnel: protectedProcedure.handler(async ({ context }) => {
    if (!context.session?.user?.id) {
      throw new Error("Non authentifié");
    }

    // Vérifier que l'utilisateur est un professionnel
    const [userData] = await db
      .select()
      .from(user)
      .where(eq(user.id, context.session.user.id))
      .limit(1);

    if (!userData || userData.type !== "PROFESSIONNEL") {
      throw new Error("Cet utilisateur n'est pas un professionnel");
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

    return prof;
  }),

  // Récupérer le particulier connecté
  getCurrentParticulier: protectedProcedure.handler(async ({ context }) => {
    if (!context.session?.user?.id) {
      throw new Error("Non authentifié");
    }

    // Vérifier que l'utilisateur est un particulier
    const [userData] = await db
      .select()
      .from(user)
      .where(eq(user.id, context.session.user.id))
      .limit(1);

    if (!userData || userData.type !== "PARTICULIER") {
      throw new Error("Cet utilisateur n'est pas un particulier");
    }

    // Récupérer le particulier lié à l'utilisateur
    const [part] = await db
      .select()
      .from(particulier)
      .where(eq(particulier.userId, context.session.user.id))
      .limit(1);

    if (!part) {
      throw new Error("Aucun particulier associé à ce compte");
    }

    // Récupérer le patient associé
    const [p] = await db
      .select()
      .from(patient)
      .where(eq(patient.id, part.patientId))
      .limit(1);

    const [info] = await db
      .select()
      .from(informationIdentite)
      .where(eq(informationIdentite.id, p.informationIdentiteId))
      .limit(1);

    const [coord] = await db
      .select()
      .from(informationCoordonnee)
      .where(eq(informationCoordonnee.id, p.informationCoordonneeId))
      .limit(1);

    return {
      ...part,
      patient: {
        ...p,
        informationIdentite: info,
        informationCoordonnee: coord,
      },
      user: userData,
    };
  }),

  // Récupérer les tâches du particulier connecté
  listTachesByParticulier: protectedProcedure.handler(async ({ context }) => {
    if (!context.session?.user?.id) {
      throw new Error("Non authentifié");
    }

    // Vérifier que l'utilisateur est un particulier
    const [userData] = await db
      .select()
      .from(user)
      .where(eq(user.id, context.session.user.id))
      .limit(1);

    if (!userData || userData.type !== "PARTICULIER") {
      throw new Error("Cet utilisateur n'est pas un particulier");
    }

    // Récupérer le particulier lié à l'utilisateur
    const [part] = await db
      .select()
      .from(particulier)
      .where(eq(particulier.userId, context.session.user.id))
      .limit(1);

    if (!part) {
      throw new Error("Aucun particulier associé à ce compte");
    }

    // Récupérer les tâches du patient associé au particulier
    const taches = await db
      .select()
      .from(tache)
      .where(eq(tache.patientId, part.patientId))
      .orderBy(desc(tache.date));

    // Récupérer les professionnels associés
    const professionnelIds = [
      ...new Set(taches.map((t) => t.professionnelId)),
    ];
    const professionnels = await db
      .select()
      .from(professionnel)
      .where(inArray(professionnel.id, professionnelIds));
    const profById = new Map(
      professionnels.map((p) => [p.id, p])
    );

    // Récupérer le patient
    const [p] = await db
      .select()
      .from(patient)
      .where(eq(patient.id, part.patientId))
      .limit(1);

    const [info] = await db
      .select()
      .from(informationIdentite)
      .where(eq(informationIdentite.id, p.informationIdentiteId))
      .limit(1);

    // Construire la réponse avec les informations du professionnel
    return taches.map((t) => ({
      ...t,
      professionnel: profById.get(t.professionnelId) || null,
      patient: {
        ...p,
        informationIdentite: info,
      },
    }));
  }),

  // Récupérer les informations du patient pour le particulier connecté
  getPatientByIdForParticulier: protectedProcedure.handler(
    async ({ context }) => {
      if (!context.session?.user?.id) {
        throw new Error("Non authentifié");
      }

      // Vérifier que l'utilisateur est un particulier
      const [userData] = await db
        .select()
        .from(user)
        .where(eq(user.id, context.session.user.id))
        .limit(1);

      if (!userData || userData.type !== "PARTICULIER") {
        throw new Error("Cet utilisateur n'est pas un particulier");
      }

      // Récupérer le particulier lié à l'utilisateur
      const [part] = await db
        .select()
        .from(particulier)
        .where(eq(particulier.userId, context.session.user.id))
        .limit(1);

      if (!part) {
        throw new Error("Aucun particulier associé à ce compte");
      }

      // Récupérer le patient associé
      const [p] = await db
        .select()
        .from(patient)
        .where(eq(patient.id, part.patientId))
        .limit(1);

      if (!p) {
        throw new Error("Patient non trouvé");
      }

      const [info] = await db
        .select()
        .from(informationIdentite)
        .where(eq(informationIdentite.id, p.informationIdentiteId));

      const [coordonnee] = await db
        .select()
        .from(informationCoordonnee)
        .where(eq(informationCoordonnee.id, p.informationCoordonneeId));

      return {
        ...p,
        informationIdentite: info,
        informationCoordonnee: coordonnee,
      };
    }
  ),

  // --- DOCUMENTS ---

  // Récupérer les documents d'un patient spécifique
  listDocumentsByPatient: protectedProcedure
    .input(z.object({ patientId: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      if (!context.session?.user?.id) {
        throw new Error("Non authentifié");
      }

      // Récupérer le type d'utilisateur
      const [userData] = await db
        .select()
        .from(user)
        .where(eq(user.id, context.session.user.id))
        .limit(1);

      if (!userData) {
        throw new Error("Utilisateur non trouvé");
      }

      // Vérification selon le type d'utilisateur
      if (userData.type === "PROFESSIONNEL") {
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
      } else if (userData.type === "PARTICULIER") {
        // Récupérer le particulier lié à l'utilisateur
        const [part] = await db
          .select()
          .from(particulier)
          .where(eq(particulier.userId, context.session.user.id))
          .limit(1);

        if (!part) {
          throw new Error("Aucun particulier associé à ce compte");
        }

        // Vérifier que le patient correspond au particulier
        if (part.patientId !== input.patientId) {
          throw new Error("Patient non autorisé");
        }
      } else {
        throw new Error("Type d'utilisateur non reconnu");
      }

      // Récupérer les documents du patient
      const documents = await db
        .select()
        .from(document)
        .where(eq(document.patientId, input.patientId))
        .orderBy(desc(document.createdAt));

      return documents;
    }),

  // Créer un nouveau document
  createDocument: protectedProcedure
    .input(
      z.object({
        patientId: z.string().uuid(),
        nom: z.string(),
        categorie: z.enum([
          "IDENTITE",
          "MEDICAL",
          "ADMINISTRATIF",
          "JURIDIQUE",
          "LOGEMENT",
          "EMPLOI",
          "AUTRE",
        ]),
        cheminFichier: z.string(),
        typeMime: z.string(),
        taille: z.string(),
        description: z.string().optional(),
      })
    )
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

      // Créer le document
      const [newDocument] = await db
        .insert(document)
        .values({
          patientId: input.patientId,
          nom: input.nom,
          categorie: input.categorie,
          cheminFichier: input.cheminFichier,
          typeMime: input.typeMime,
          taille: input.taille,
          description: input.description,
        })
        .returning();

      return newDocument;
    }),

  // Supprimer un document
  deleteDocument: protectedProcedure
    .input(z.object({ documentId: z.string().uuid() }))
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

      // Récupérer le document pour vérifier qu'il appartient à un patient du professionnel
      const [doc] = await db
        .select()
        .from(document)
        .where(eq(document.id, input.documentId))
        .limit(1);

      if (!doc) {
        throw new Error("Document non trouvé");
      }

      // Vérifier que le patient appartient au professionnel
      const [patientLink] = await db
        .select()
        .from(patientProfessionnel)
        .where(
          and(
            eq(patientProfessionnel.patientId, doc.patientId),
            eq(patientProfessionnel.professionnelId, prof.id)
          )
        )
        .limit(1);

      if (!patientLink) {
        throw new Error("Document non autorisé");
      }

      // Supprimer le document
      await db.delete(document).where(eq(document.id, input.documentId));

      return { success: true };
    }),

  // --- NOTIFICATIONS ---

  // Récupérer les notifications du professionnel connecté
  listNotificationsByProfessionnel: protectedProcedure.handler(
    async ({ context }) => {
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

      // Récupérer les notifications du professionnel, triées par date (non lues en premier)
      const notifications = await db
        .select()
        .from(notification)
        .where(eq(notification.professionnelId, prof.id))
        .orderBy(desc(notification.createdAt));

      // Trier pour mettre les non lues en premier
      return notifications.sort((a, b) => {
        if (a.lue === b.lue) {
          return 0;
        }
        return a.lue ? 1 : -1;
      });
    }
  ),

  // Récupérer le nombre de notifications non lues
  getUnreadNotificationsCount: protectedProcedure.handler(
    async ({ context }) => {
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

      // Compter les notifications non lues
      const unreadNotifications = await db
        .select()
        .from(notification)
        .where(
          and(
            eq(notification.professionnelId, prof.id),
            eq(notification.lue, false)
          )
        );

      return { count: unreadNotifications.length };
    }
  ),

  // Marquer une notification comme lue
  markNotificationAsRead: protectedProcedure
    .input(z.object({ notificationId: z.string().uuid() }))
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

      // Vérifier que la notification appartient au professionnel
      const [notif] = await db
        .select()
        .from(notification)
        .where(
          and(
            eq(notification.id, input.notificationId),
            eq(notification.professionnelId, prof.id)
          )
        )
        .limit(1);

      if (!notif) {
        throw new Error("Notification non trouvée ou non autorisée");
      }

      // Marquer comme lue
      await db
        .update(notification)
        .set({ lue: true })
        .where(eq(notification.id, input.notificationId));

      return { success: true };
    }),

  // Marquer toutes les notifications comme lues
  markAllNotificationsAsRead: protectedProcedure.handler(async ({ context }) => {
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

    // Marquer toutes les notifications non lues comme lues
    await db
      .update(notification)
      .set({ lue: true })
      .where(
        and(
          eq(notification.professionnelId, prof.id),
          eq(notification.lue, false)
        )
      );

    return { success: true };
  }),

  // Créer une notification
  createNotification: protectedProcedure
    .input(
      z.object({
        professionnelId: z.string().uuid().optional(),
        patientId: z.string().uuid().optional(),
        type: z.enum(["INFO", "WARNING", "ERROR", "SUCCESS"]),
        titre: z.string(),
        message: z.string(),
        lien: z.string().optional(),
      })
    )
    .handler(async ({ input, context }) => {
      if (!context.session?.user?.id) {
        throw new Error("Non authentifié");
      }

      // Si professionnelId est fourni, vérifier qu'il correspond au professionnel connecté
      if (input.professionnelId) {
        const [prof] = await db
          .select()
          .from(professionnel)
          .where(eq(professionnel.userId, context.session.user.id))
          .limit(1);

        if (!prof || prof.id !== input.professionnelId) {
          throw new Error("Non autorisé à créer une notification pour ce professionnel");
        }
      }

      // Si patientId est fourni, vérifier que le patient appartient au professionnel connecté
      if (input.patientId) {
        const [prof] = await db
          .select()
          .from(professionnel)
          .where(eq(professionnel.userId, context.session.user.id))
          .limit(1);

        if (!prof) {
          throw new Error("Aucun professionnel associé à ce compte");
        }

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
      }

      // Créer la notification
      const [newNotification] = await db
        .insert(notification)
        .values({
          professionnelId: input.professionnelId || null,
          patientId: input.patientId || null,
          type: input.type,
          titre: input.titre,
          message: input.message,
          lien: input.lien || null,
        })
        .returning();

      return newNotification;
    }),

  // Récupérer les notifications d'un patient spécifique
  listNotificationsByPatient: protectedProcedure
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

      // Récupérer les notifications du patient
      const notifications = await db
        .select()
        .from(notification)
        .where(eq(notification.patientId, input.patientId))
        .orderBy(desc(notification.createdAt));

      return notifications;
    }),
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
