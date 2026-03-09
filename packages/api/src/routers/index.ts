import type { RouterClient } from "@orpc/server";
import { eq, and, inArray, or, desc } from "drizzle-orm";
import { z } from "zod";

import {
  db,
  informationIdentite,
  informationCoordonnee,
  informationConjoint,
  patient,
  personneProche,
  professionnel,
  particulier,
  patientProfessionnel,
  demandeAccesPatient,
  tache,
  document,
  notification,
  user,
  demande,
  demandeEtape,
} from "@webapp-adminserein/db";
import { backendStepsByDemandeType } from "../utils/demandes-steps";
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
  caisseRetraite: z
    .enum(["ASSURANCE_RETRAITE", "FONCTION_PUBLIQUE_ETAT", "MSA", "AUTRE"])
    .optional(),
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

const informationConjointInputSchema = z.object({
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
});

const personneProcheInputSchema = z.object({
  genre: z.enum(["MASCULIN", "FEMININ", "AUTRE"]),
  nomUsage: z.string(),
  nomNaissance: z.string(),
  prenom: z.string(),
  autresPrenoms: z.array(z.string()).optional().default([]),
  adresse: z.string(),
  codePostal: z.string(),
  ville: z.string(),
  telephone: z.string(),
  mail: z.string(),
  lien: z.string(),
});

const personneProcheUpdateSchema = personneProcheInputSchema.partial().extend({
  id: z.string().uuid(),
});

const patientUpdateInputSchema = z.object({
  patientId: z.string().uuid(),
  // Champs optionnels : on ne met à jour que ceux présents
  numeroDossier: z.string().optional(),
  informationIdentite: informationIdentiteInputSchema.partial().optional(),
  informationCoordonnee: informationCoordonneeInputSchema.partial().optional(),
  informationConjoint: informationConjointInputSchema.partial().optional(),
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
          caisseRetraite: info.caisseRetraite ?? null,
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
        informationConjoint: conjoint,
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
            ...(info.caisseRetraite && {
              caisseRetraite: info.caisseRetraite,
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

      if (conjoint && Object.keys(conjoint).length > 0) {
        // Normaliser les tableaux
        const autresPrenoms =
          conjoint.autresPrenoms && conjoint.autresPrenoms.length > 0
            ? conjoint.autresPrenoms
            : [];
        const nationalites =
          conjoint.nationalites && conjoint.nationalites.length > 0
            ? conjoint.nationalites
            : [];

        if (existing.informationConjointId) {
          await db
            .update(informationConjoint)
            .set({
              ...(conjoint.nomUsage && { nomUsage: conjoint.nomUsage }),
              ...(conjoint.nomNaissance && {
                nomNaissance: conjoint.nomNaissance,
              }),
              ...(conjoint.prenom && { prenom: conjoint.prenom }),
              ...(conjoint.autresPrenoms && {
                autresPrenoms,
              }),
              ...(conjoint.genre && { genre: conjoint.genre }),
              ...(conjoint.dateNaissance && {
                dateNaissance: new Date(conjoint.dateNaissance),
              }),
              ...(conjoint.villeNaissance && {
                villeNaissance: conjoint.villeNaissance,
              }),
              ...(conjoint.departementNaissance && {
                departementNaissance: conjoint.departementNaissance,
              }),
              ...(conjoint.paysNaissance && {
                paysNaissance: conjoint.paysNaissance,
              }),
              ...(conjoint.nationalites && { nationalites }),
              ...(conjoint.numeroSecuriteSociale && {
                numeroSecuriteSociale: conjoint.numeroSecuriteSociale,
              }),
            })
            .where(eq(informationConjoint.id, existing.informationConjointId));
        } else {
          const [createdConjoint] = await db
            .insert(informationConjoint)
            .values({
              nomUsage: conjoint.nomUsage ?? "",
              nomNaissance: conjoint.nomNaissance ?? "",
              prenom: conjoint.prenom ?? "",
              autresPrenoms,
              genre: conjoint.genre ?? "AUTRE",
              dateNaissance: conjoint.dateNaissance
                ? new Date(conjoint.dateNaissance)
                : new Date(),
              villeNaissance: conjoint.villeNaissance ?? "",
              departementNaissance: conjoint.departementNaissance ?? "",
              paysNaissance: conjoint.paysNaissance ?? "",
              nationalites,
              numeroSecuriteSociale: conjoint.numeroSecuriteSociale ?? "",
            })
            .returning();

          await db
            .update(patient)
            .set({ informationConjointId: createdConjoint.id })
            .where(eq(patient.id, patientId));
        }
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

      const [updatedConjoint] =
        updatedPatient.informationConjointId != null
          ? await db
              .select()
              .from(informationConjoint)
              .where(
                eq(informationConjoint.id, updatedPatient.informationConjointId)
              )
          : [undefined];

      return {
        ...updatedPatient,
        informationIdentite: updatedInfo,
        informationCoordonnee: updatedCoordonnee,
        informationConjoint: updatedConjoint ?? null,
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

      const [conjoint] =
        p.informationConjointId != null
          ? await db
              .select()
              .from(informationConjoint)
              .where(eq(informationConjoint.id, p.informationConjointId))
          : [undefined];

      return {
        ...p,
        informationIdentite: info,
        informationCoordonnee: coordonnee,
        informationConjoint: conjoint ?? null,
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

      // Vérifier s'il existe déjà une demande d'accès EN_ATTENTE
      // pour ce couple patient/professionnel. On filtre directement
      // sur le statut pour éviter les doublons de demandes en cours.
      const [existingDemandeEnAttente] = await db
        .select()
        .from(demandeAccesPatient)
        .where(
          and(
            eq(demandeAccesPatient.patientId, existingPatient.id),
            eq(demandeAccesPatient.professionnelId, prof.id),
            eq(demandeAccesPatient.statut, "EN_ATTENTE")
          )
        )
        .limit(1);

      if (existingDemandeEnAttente) {
        throw new Error(
          "Une demande d'accès est déjà en attente pour ce patient."
        );
      }

      // Créer une nouvelle demande d'accès en attente
      const [demande] = await db
        .insert(demandeAccesPatient)
        .values({
          patientId: existingPatient.id,
          professionnelId: prof.id,
          statut: "EN_ATTENTE",
        })
        .returning();

      // Récupérer les informations d'identité pour le retour
      const [info] = await db
        .select()
        .from(informationIdentite)
        .where(eq(informationIdentite.id, existingPatient.informationIdentiteId))
        .limit(1);

      // Créer une notification pour le patient
      await db.insert(notification).values({
        patientId: existingPatient.id,
        professionnelId: null,
        type: "INFO",
        titre: "Nouvelle demande d'accès à votre dossier",
        message: `Le professionnel ${prof.prenom} ${prof.nom} (${prof.fonction}) souhaite accéder à votre dossier.`,
        lien: "/mes-informations", // page où le patient gère ses demandes
      });

      // Créer une tâche de suivi pour le professionnel
      await db.insert(tache).values({
        patientId: existingPatient.id,
        professionnelId: prof.id,
        typeDemarche: "ADMINISTRATIVE",
        etat: "A_FAIRE",
        date: new Date(),
        details:
          info
            ? `Demande d'accès au dossier en attente de réponse du patient ${info.prenom} ${info.nomUsage}.`
            : "Demande d'accès au dossier en attente de réponse du patient.",
      });

      return {
        ...existingPatient,
        informationIdentite: info,
        demandeAcces: {
          id: demande.id,
          statut: demande.statut,
        },
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

    const conjoints = await db.select().from(informationConjoint);
    const conjointById = new Map(conjoints.map((c) => [c.id, c]));

    return patients.map((p) => ({
      ...p,
      informationIdentite: infoById.get(p.informationIdentiteId),
      informationCoordonnee: coordonneeById.get(p.informationCoordonneeId),
      informationConjoint: p.informationConjointId
        ? conjointById.get(p.informationConjointId)
        : null,
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

      // Si ce n'est pas un professionnel (par exemple un particulier),
      // on retourne simplement une liste vide plutôt qu'une erreur,
      // afin de ne pas bloquer l'accès aux pages côté client.
      if (!userData || userData.type !== "PROFESSIONNEL") {
        return [];
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

  // Récupérer les documents du particulier connecté
  listDocumentsByParticulier: protectedProcedure.handler(async ({ context }) => {
    if (!context.session?.user?.id) {
      throw new Error("Non authentifié");
    }

    const [userData] = await db
      .select()
      .from(user)
      .where(eq(user.id, context.session.user.id))
      .limit(1);

    if (!userData || userData.type !== "PARTICULIER") {
      throw new Error("Cet utilisateur n'est pas un particulier");
    }

    const [part] = await db
      .select()
      .from(particulier)
      .where(eq(particulier.userId, context.session.user.id))
      .limit(1);

    if (!part) {
      throw new Error("Aucun particulier associé à ce compte");
    }

    const documents = await db
      .select()
      .from(document)
      .where(eq(document.patientId, part.patientId))
      .orderBy(desc(document.createdAt));

    return documents;
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

      const [conjoint] =
        p.informationConjointId != null
          ? await db
              .select()
              .from(informationConjoint)
              .where(eq(informationConjoint.id, p.informationConjointId))
          : [undefined];

      return {
        ...p,
        informationIdentite: info,
        informationCoordonnee: coordonnee,
        informationConjoint: conjoint ?? null,
      };
    }
  ),

  // Lister les demandes d'accès au dossier pour le patient connecté (particulier)
  listDemandesAccesByPatient: protectedProcedure.handler(async ({ context }) => {
    if (!context.session?.user?.id) {
      throw new Error("Non authentifié");
    }

    const [userData] = await db
      .select()
      .from(user)
      .where(eq(user.id, context.session.user.id))
      .limit(1);

    if (!userData || userData.type !== "PARTICULIER") {
      throw new Error("Cet utilisateur n'est pas un particulier");
    }

    const [part] = await db
      .select()
      .from(particulier)
      .where(eq(particulier.userId, context.session.user.id))
      .limit(1);

    if (!part) {
      throw new Error("Aucun particulier associé à ce compte");
    }

    const demandes = await db
      .select()
      .from(demandeAccesPatient)
      .where(
        and(
          eq(demandeAccesPatient.patientId, part.patientId),
          eq(demandeAccesPatient.statut, "EN_ATTENTE")
        )
      );

    if (demandes.length === 0) {
      return [];
    }

    const professionnelIds = Array.from(
      new Set(demandes.map((d) => d.professionnelId))
    );

    const pros = await db
      .select()
      .from(professionnel)
      .where(inArray(professionnel.id, professionnelIds));

    const proById = new Map(pros.map((p) => [p.id, p]));

    return demandes.map((d) => ({
      ...d,
      professionnel: proById.get(d.professionnelId) ?? null,
    }));
  }),

  // --- PERSONNES PROCHES ---

  // Lister les personnes proches pour un patient (côté professionnel)
  listPersonnesProchesByPatient: protectedProcedure
    .input(z.object({ patientId: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      if (!context.session?.user?.id) {
        throw new Error("Non authentifié");
      }

      // Vérifier que l'utilisateur est un professionnel et qu'il suit ce patient
      const [prof] = await db
        .select()
        .from(professionnel)
        .where(eq(professionnel.userId, context.session.user.id))
        .limit(1);

      if (!prof) {
        throw new Error("Aucun professionnel associé à ce compte");
      }

      const [link] = await db
        .select()
        .from(patientProfessionnel)
        .where(
          and(
            eq(patientProfessionnel.patientId, input.patientId),
            eq(patientProfessionnel.professionnelId, prof.id)
          )
        )
        .limit(1);

      if (!link) {
        throw new Error("Patient non trouvé ou non autorisé");
      }

      const personnes = await db
        .select()
        .from(personneProche)
        .where(eq(personneProche.patientId, input.patientId))
        .orderBy(personneProche.ordre, personneProche.createdAt);

      return personnes;
    }),

  // Créer une personne proche pour un patient (côté professionnel)
  createPersonneProche: protectedProcedure
    .input(
      z.object({
        patientId: z.string().uuid(),
        personne: personneProcheInputSchema,
      })
    )
    .handler(async ({ input, context }) => {
      if (!context.session?.user?.id) {
        throw new Error("Non authentifié");
      }

      const [prof] = await db
        .select()
        .from(professionnel)
        .where(eq(professionnel.userId, context.session.user.id))
        .limit(1);

      if (!prof) {
        throw new Error("Aucun professionnel associé à ce compte");
      }

      const [link] = await db
        .select()
        .from(patientProfessionnel)
        .where(
          and(
            eq(patientProfessionnel.patientId, input.patientId),
            eq(patientProfessionnel.professionnelId, prof.id)
          )
        )
        .limit(1);

      if (!link) {
        throw new Error("Patient non trouvé ou non autorisé");
      }

      // Calculer le prochain ordre
      const existants = await db
        .select({ ordre: personneProche.ordre })
        .from(personneProche)
        .where(eq(personneProche.patientId, input.patientId));

      const nextOrdre =
        existants.length > 0
          ? Math.max(...existants.map((p) => p.ordre ?? 0)) + 1
          : 0;

      const p = input.personne;

      const [created] = await db
        .insert(personneProche)
        .values({
          patientId: input.patientId,
          genre: p.genre,
          nomUsage: p.nomUsage,
          nomNaissance: p.nomNaissance,
          prenom: p.prenom,
          autresPrenoms: p.autresPrenoms,
          adresse: p.adresse,
          codePostal: p.codePostal,
          ville: p.ville,
          telephone: p.telephone,
          mail: p.mail,
          lien: p.lien,
          ordre: nextOrdre,
        })
        .returning();

      return created;
    }),

  // Mettre à jour une personne proche (côté professionnel)
  updatePersonneProche: protectedProcedure
    .input(personneProcheUpdateSchema)
    .handler(async ({ input, context }) => {
      if (!context.session?.user?.id) {
        throw new Error("Non authentifié");
      }

      const [prof] = await db
        .select()
        .from(professionnel)
        .where(eq(professionnel.userId, context.session.user.id))
        .limit(1);

      if (!prof) {
        throw new Error("Aucun professionnel associé à ce compte");
      }

      const [existing] = await db
        .select()
        .from(personneProche)
        .where(eq(personneProche.id, input.id))
        .limit(1);

      if (!existing) {
        throw new Error("Personne proche non trouvée");
      }

      const [link] = await db
        .select()
        .from(patientProfessionnel)
        .where(
          and(
            eq(patientProfessionnel.patientId, existing.patientId),
            eq(patientProfessionnel.professionnelId, prof.id)
          )
        )
        .limit(1);

      if (!link) {
        throw new Error("Patient non autorisé pour cette personne proche");
      }

      await db
        .update(personneProche)
        .set({
          ...(input.genre && { genre: input.genre }),
          ...(input.nomUsage && { nomUsage: input.nomUsage }),
          ...(input.nomNaissance && { nomNaissance: input.nomNaissance }),
          ...(input.prenom && { prenom: input.prenom }),
          ...(input.autresPrenoms && { autresPrenoms: input.autresPrenoms }),
          ...(input.adresse && { adresse: input.adresse }),
          ...(input.codePostal && { codePostal: input.codePostal }),
          ...(input.ville && { ville: input.ville }),
          ...(input.telephone && { telephone: input.telephone }),
          ...(input.mail && { mail: input.mail }),
          ...(input.lien && { lien: input.lien }),
        })
        .where(eq(personneProche.id, input.id));

      const [updated] = await db
        .select()
        .from(personneProche)
        .where(eq(personneProche.id, input.id))
        .limit(1);

      return updated;
    }),

  // Réordonner les personnes proches pour un patient (côté professionnel)
  reorderPersonnesProches: protectedProcedure
    .input(
      z.object({
        patientId: z.string().uuid(),
        ordre: z
          .array(
            z.object({
              id: z.string().uuid(),
              ordre: z.number(),
            })
          )
          .nonempty(),
      })
    )
    .handler(async ({ input, context }) => {
      if (!context.session?.user?.id) {
        throw new Error("Non authentifié");
      }

      const [prof] = await db
        .select()
        .from(professionnel)
        .where(eq(professionnel.userId, context.session.user.id))
        .limit(1);

      if (!prof) {
        throw new Error("Aucun professionnel associé à ce compte");
      }

      const [link] = await db
        .select()
        .from(patientProfessionnel)
        .where(
          and(
            eq(patientProfessionnel.patientId, input.patientId),
            eq(patientProfessionnel.professionnelId, prof.id)
          )
        )
        .limit(1);

      if (!link) {
        throw new Error("Patient non trouvé ou non autorisé");
      }

      for (const item of input.ordre) {
        await db
          .update(personneProche)
          .set({ ordre: item.ordre })
          .where(eq(personneProche.id, item.id));
      }

      return { success: true };
    }),

  // Lister les personnes proches pour le patient connecté (côté particulier)
  listPersonnesProchesByParticulier: protectedProcedure.handler(
    async ({ context }) => {
      if (!context.session?.user?.id) {
        throw new Error("Non authentifié");
      }

      const [userData] = await db
        .select()
        .from(user)
        .where(eq(user.id, context.session.user.id))
        .limit(1);

      if (!userData || userData.type !== "PARTICULIER") {
        throw new Error("Cet utilisateur n'est pas un particulier");
      }

      const [part] = await db
        .select()
        .from(particulier)
        .where(eq(particulier.userId, context.session.user.id))
        .limit(1);

      if (!part) {
        throw new Error("Aucun particulier associé à ce compte");
      }

      const personnes = await db
        .select()
        .from(personneProche)
        .where(eq(personneProche.patientId, part.patientId))
        .orderBy(personneProche.ordre, personneProche.createdAt);

      return personnes;
    }
  ),

  // Créer une personne proche (côté particulier)
  createPersonneProcheByParticulier: protectedProcedure
    .input(
      z.object({
        personne: personneProcheInputSchema,
      })
    )
    .handler(async ({ input, context }) => {
      if (!context.session?.user?.id) {
        throw new Error("Non authentifié");
      }

      const [userData] = await db
        .select()
        .from(user)
        .where(eq(user.id, context.session.user.id))
        .limit(1);

      if (!userData || userData.type !== "PARTICULIER") {
        throw new Error("Cet utilisateur n'est pas un particulier");
      }

      const [part] = await db
        .select()
        .from(particulier)
        .where(eq(particulier.userId, context.session.user.id))
        .limit(1);

      if (!part) {
        throw new Error("Aucun particulier associé à ce compte");
      }

      const existants = await db
        .select({ ordre: personneProche.ordre })
        .from(personneProche)
        .where(eq(personneProche.patientId, part.patientId));

      const nextOrdre =
        existants.length > 0
          ? Math.max(...existants.map((p) => p.ordre ?? 0)) + 1
          : 0;

      const p = input.personne;

      const [created] = await db
        .insert(personneProche)
        .values({
          patientId: part.patientId,
          genre: p.genre,
          nomUsage: p.nomUsage,
          nomNaissance: p.nomNaissance,
          prenom: p.prenom,
          autresPrenoms: p.autresPrenoms,
          adresse: p.adresse,
          codePostal: p.codePostal,
          ville: p.ville,
          telephone: p.telephone,
          mail: p.mail,
          lien: p.lien,
          ordre: nextOrdre,
        })
        .returning();

      return created;
    }),

  // Mettre à jour une personne proche (côté particulier)
  updatePersonneProcheByParticulier: protectedProcedure
    .input(personneProcheUpdateSchema)
    .handler(async ({ input, context }) => {
      if (!context.session?.user?.id) {
        throw new Error("Non authentifié");
      }

      const [userData] = await db
        .select()
        .from(user)
        .where(eq(user.id, context.session.user.id))
        .limit(1);

      if (!userData || userData.type !== "PARTICULIER") {
        throw new Error("Cet utilisateur n'est pas un particulier");
      }

      const [part] = await db
        .select()
        .from(particulier)
        .where(eq(particulier.userId, context.session.user.id))
        .limit(1);

      if (!part) {
        throw new Error("Aucun particulier associé à ce compte");
      }

      const [existing] = await db
        .select()
        .from(personneProche)
        .where(eq(personneProche.id, input.id))
        .limit(1);

      if (!existing) {
        throw new Error("Personne proche non trouvée");
      }

      if (existing.patientId !== part.patientId) {
        throw new Error("Personne proche non autorisée pour ce patient");
      }

      await db
        .update(personneProche)
        .set({
          ...(input.genre && { genre: input.genre }),
          ...(input.nomUsage && { nomUsage: input.nomUsage }),
          ...(input.nomNaissance && { nomNaissance: input.nomNaissance }),
          ...(input.prenom && { prenom: input.prenom }),
          ...(input.autresPrenoms && { autresPrenoms: input.autresPrenoms }),
          ...(input.adresse && { adresse: input.adresse }),
          ...(input.codePostal && { codePostal: input.codePostal }),
          ...(input.ville && { ville: input.ville }),
          ...(input.telephone && { telephone: input.telephone }),
          ...(input.mail && { mail: input.mail }),
          ...(input.lien && { lien: input.lien }),
        })
        .where(eq(personneProche.id, input.id));

      const [updated] = await db
        .select()
        .from(personneProche)
        .where(eq(personneProche.id, input.id))
        .limit(1);

      return updated;
    }),

  // Réordonner les personnes proches (côté particulier)
  reorderPersonnesProchesByParticulier: protectedProcedure
    .input(
      z.object({
        ordre: z
          .array(
            z.object({
              id: z.string().uuid(),
              ordre: z.number(),
            })
          )
          .nonempty(),
      })
    )
    .handler(async ({ input, context }) => {
      if (!context.session?.user?.id) {
        throw new Error("Non authentifié");
      }

      const [userData] = await db
        .select()
        .from(user)
        .where(eq(user.id, context.session.user.id))
        .limit(1);

      if (!userData || userData.type !== "PARTICULIER") {
        throw new Error("Cet utilisateur n'est pas un particulier");
      }

      const [part] = await db
        .select()
        .from(particulier)
        .where(eq(particulier.userId, context.session.user.id))
        .limit(1);

      if (!part) {
        throw new Error("Aucun particulier associé à ce compte");
      }

      const personnes = await db
        .select()
        .from(personneProche)
        .where(eq(personneProche.patientId, part.patientId));

      const idsAutorises = new Set(personnes.map((p) => p.id));

      for (const item of input.ordre) {
        if (!idsAutorises.has(item.id)) {
          throw new Error("Personne proche non autorisée pour ce patient");
        }
      }

      for (const item of input.ordre) {
        await db
          .update(personneProche)
          .set({ ordre: item.ordre })
          .where(eq(personneProche.id, item.id));
      }

      return { success: true };
    }),

  // Lister les professionnels ayant accès au dossier du patient connecté (particulier)
  listProfessionnelsByParticulier: protectedProcedure.handler(
    async ({ context }) => {
      if (!context.session?.user?.id) {
        throw new Error("Non authentifié");
      }

      const [userData] = await db
        .select()
        .from(user)
        .where(eq(user.id, context.session.user.id))
        .limit(1);

      if (!userData || userData.type !== "PARTICULIER") {
        throw new Error("Cet utilisateur n'est pas un particulier");
      }

      const [part] = await db
        .select()
        .from(particulier)
        .where(eq(particulier.userId, context.session.user.id))
        .limit(1);

      if (!part) {
        throw new Error("Aucun particulier associé à ce compte");
      }

      // Récupérer les professionnels liés à ce patient via patientProfessionnel
      const liens = await db
        .select({
          id: professionnel.id,
          nom: professionnel.nom,
          prenom: professionnel.prenom,
          fonction: professionnel.fonction,
          dateAttribution: patientProfessionnel.dateAttribution,
        })
        .from(patientProfessionnel)
        .innerJoin(
          professionnel,
          eq(patientProfessionnel.professionnelId, professionnel.id)
        )
        .where(eq(patientProfessionnel.patientId, part.patientId));

      return liens;
    }
  ),

  // Demander au patient de remplir une section d'informations
  demanderRemplissageInformation: protectedProcedure
    .input(
      z.object({
        patientId: z.string().uuid(),
        section: z.enum([
          "IDENTITE",
          "COORDONNEES",
          "CONJOINT",
          "PERSONNES_PROCHES",
        ]),
      })
    )
    .handler(async ({ input, context }) => {
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

      const [prof] = await db
        .select()
        .from(professionnel)
        .where(eq(professionnel.userId, context.session.user.id))
        .limit(1);

      if (!prof) {
        throw new Error("Aucun professionnel associé à ce compte");
      }

      // Vérifier que le professionnel suit bien ce patient
      const [link] = await db
        .select()
        .from(patientProfessionnel)
        .where(
          and(
            eq(patientProfessionnel.patientId, input.patientId),
            eq(patientProfessionnel.professionnelId, prof.id)
          )
        )
        .limit(1);

      if (!link) {
        throw new Error("Patient non trouvé ou non autorisé");
      }

      const [p] = await db
        .select()
        .from(patient)
        .where(eq(patient.id, input.patientId))
        .limit(1);

      if (!p) {
        throw new Error("Patient non trouvé");
      }

      const [infoPatient] = await db
        .select()
        .from(informationIdentite)
        .where(eq(informationIdentite.id, p.informationIdentiteId))
        .limit(1);

      const sectionLabels: Record<
        "IDENTITE" | "COORDONNEES" | "CONJOINT" | "PERSONNES_PROCHES",
        string
      > = {
        IDENTITE: "vos informations d'identité",
        COORDONNEES: "vos coordonnées",
        CONJOINT: "les informations concernant votre conjoint",
        PERSONNES_PROCHES: "la section \"Personnes proches\"",
      };

      const titre = "Mise à jour de vos informations";
      const message = `Le professionnel ${
        prof.prenom
      } ${prof.nom} vous demande de compléter ou mettre à jour ${sectionLabels[input.section]} dans votre espace personnel.`;

      // Créer une notification pour le patient
      await db.insert(notification).values({
        patientId: input.patientId,
        professionnelId: null,
        type: "INFO",
        titre,
        message,
        lien: "/mes-informations",
      });

      // Créer une tâche liée à cette demande
      await db.insert(tache).values({
        patientId: input.patientId,
        professionnelId: prof.id,
        typeDemarche: "ADMINISTRATIVE",
        etat: "A_FAIRE",
        date: new Date(),
        details: `Demande faite au patient ${
          infoPatient?.prenom ?? ""
        } ${infoPatient?.nomUsage ?? ""} pour compléter ${sectionLabels[input.section]}.`,
      });

      return { success: true };
    }),

  // Demander au patient de fournir un document
  demanderDocumentPatient: protectedProcedure
    .input(
      z.object({
        patientId: z.string().uuid(),
        nature: z.string().min(1).max(200),
      })
    )
    .handler(async ({ input, context }) => {
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

      const [prof] = await db
        .select()
        .from(professionnel)
        .where(eq(professionnel.userId, context.session.user.id))
        .limit(1);

      if (!prof) {
        throw new Error("Aucun professionnel associé à ce compte");
      }

      // Vérifier que le professionnel suit bien ce patient
      const [link] = await db
        .select()
        .from(patientProfessionnel)
        .where(
          and(
            eq(patientProfessionnel.patientId, input.patientId),
            eq(patientProfessionnel.professionnelId, prof.id)
          )
        )
        .limit(1);

      if (!link) {
        throw new Error("Patient non trouvé ou non autorisé");
      }

      const [p] = await db
        .select()
        .from(patient)
        .where(eq(patient.id, input.patientId))
        .limit(1);

      if (!p) {
        throw new Error("Patient non trouvé");
      }

      const [infoPatient] = await db
        .select()
        .from(informationIdentite)
        .where(eq(informationIdentite.id, p.informationIdentiteId))
        .limit(1);

      const titre = "Demande de document";
      const message = `Le professionnel ${
        prof.prenom
      } ${prof.nom} vous demande de déposer un document (${input.nature}) dans la section "Documents" de votre espace personnel pour votre dossier${
        infoPatient
          ? ` (${infoPatient.nomUsage} ${infoPatient.prenom})`
          : ""
      }.`;

      // Créer une notification pour le patient
      await db.insert(notification).values({
        patientId: input.patientId,
        professionnelId: null,
        type: "INFO",
        titre,
        message,
        lien: "/mes-informations?tab=document",
      });

      // Créer une tâche liée à cette demande
      await db.insert(tache).values({
        patientId: input.patientId,
        professionnelId: prof.id,
        typeDemarche: "ADMINISTRATIVE",
        etat: "A_FAIRE",
        date: new Date(),
        details: `Demande de document (${input.nature}) pour le dossier du patient ${
          infoPatient?.nomUsage ?? ""
        } ${infoPatient?.prenom ?? ""}`.trim(),
      });

      return { success: true };
    }),

  // Retirer un professionnel (assistante sociale) du dossier du particulier connecté
  removeProfessionnelByParticulier: protectedProcedure
    .input(
      z.object({
        professionnelId: z.string().uuid(),
      })
    )
    .handler(async ({ input, context }) => {
      if (!context.session?.user?.id) {
        throw new Error("Non authentifié");
      }

      const [userData] = await db
        .select()
        .from(user)
        .where(eq(user.id, context.session.user.id))
        .limit(1);

      if (!userData || userData.type !== "PARTICULIER") {
        throw new Error("Cet utilisateur n'est pas un particulier");
      }

      const [part] = await db
        .select()
        .from(particulier)
        .where(eq(particulier.userId, context.session.user.id))
        .limit(1);

      if (!part) {
        throw new Error("Aucun particulier associé à ce compte");
      }

      // Vérifier que le lien existe bien entre ce patient et ce professionnel
      const [existingLink] = await db
        .select()
        .from(patientProfessionnel)
        .where(
          and(
            eq(patientProfessionnel.patientId, part.patientId),
            eq(patientProfessionnel.professionnelId, input.professionnelId)
          )
        )
        .limit(1);

      if (!existingLink) {
        throw new Error("Ce professionnel n'est pas lié à votre dossier");
      }

      // Récupérer les infos du professionnel
      const [prof] = await db
        .select()
        .from(professionnel)
        .where(eq(professionnel.id, input.professionnelId))
        .limit(1);

      // Récupérer les infos du patient pour le message
      const [patientData] = await db
        .select()
        .from(patient)
        .where(eq(patient.id, part.patientId))
        .limit(1);

      let patientNom = "ce patient";
      if (patientData) {
        const [info] = await db
          .select()
          .from(informationIdentite)
          .where(eq(informationIdentite.id, patientData.informationIdentiteId))
          .limit(1);
        if (info) {
          patientNom = `${info.prenom} ${info.nomUsage}`;
        }
      }

      // Supprimer toutes les tâches liées à ce couple patient / professionnel
      const tachesNonTerminees = await db
        .select()
        .from(tache)
        .where(
          and(
            eq(tache.patientId, part.patientId),
            eq(tache.professionnelId, input.professionnelId),
            or(eq(tache.etat, "A_FAIRE"), eq(tache.etat, "EN_COURS"))
          )
        );

      const nombreTachesNonTerminees = tachesNonTerminees.length;

      await db
        .delete(tache)
        .where(
          and(
            eq(tache.patientId, part.patientId),
            eq(tache.professionnelId, input.professionnelId)
          )
        );

      // Supprimer le lien patient-professionnel
      await db
        .delete(patientProfessionnel)
        .where(
          and(
            eq(patientProfessionnel.patientId, part.patientId),
            eq(patientProfessionnel.professionnelId, input.professionnelId)
          )
        );

      // Créer une notification pour le professionnel si trouvé
      if (prof) {
        const messageNotification =
          nombreTachesNonTerminees > 0
            ? `Le patient ${patientNom} a mis fin à votre suivi. ${nombreTachesNonTerminees} tâche(s) non terminée(s) ${nombreTachesNonTerminees > 1 ? "ont été" : "a été"} supprimée(s).`
            : `Le patient ${patientNom} a mis fin à votre suivi.`;

        await db.insert(notification).values({
          professionnelId: prof.id,
          patientId: null,
          type: nombreTachesNonTerminees > 0 ? "WARNING" : "INFO",
          titre: "Suivi interrompu par le patient",
          message: messageNotification,
          lien: null,
        });
      }

      return {
        success: true,
        nombreTachesSupprimees: nombreTachesNonTerminees,
      };
    }),

  // Répondre à une demande d'accès (accepter ou refuser) côté patient
  repondreDemandeAcces: protectedProcedure
    .input(
      z.object({
        demandeId: z.string().uuid(),
        decision: z.enum(["ACCEPTER", "REFUSER"]),
      })
    )
    .handler(async ({ input, context }) => {
      if (!context.session?.user?.id) {
        throw new Error("Non authentifié");
      }

      const [userData] = await db
        .select()
        .from(user)
        .where(eq(user.id, context.session.user.id))
        .limit(1);

      if (!userData || userData.type !== "PARTICULIER") {
        throw new Error("Cet utilisateur n'est pas un particulier");
      }

      const [part] = await db
        .select()
        .from(particulier)
        .where(eq(particulier.userId, context.session.user.id))
        .limit(1);

      if (!part) {
        throw new Error("Aucun particulier associé à ce compte");
      }

      const [demande] = await db
        .select()
        .from(demandeAccesPatient)
        .where(eq(demandeAccesPatient.id, input.demandeId))
        .limit(1);

      if (!demande) {
        throw new Error("Demande d'accès non trouvée");
      }

      if (demande.patientId !== part.patientId) {
        throw new Error("Demande d'accès non autorisée pour ce patient");
      }

      if (demande.statut !== "EN_ATTENTE") {
        throw new Error("Cette demande a déjà été traitée");
      }

      // Récupérer le patient et le professionnel concernés
      const [p] = await db
        .select()
        .from(patient)
        .where(eq(patient.id, demande.patientId))
        .limit(1);

      if (!p) {
        throw new Error("Patient non trouvé");
      }

      const [infoPatient] = await db
        .select()
        .from(informationIdentite)
        .where(eq(informationIdentite.id, p.informationIdentiteId))
        .limit(1);

      const [prof] = await db
        .select()
        .from(professionnel)
        .where(eq(professionnel.id, demande.professionnelId))
        .limit(1);

      if (!prof) {
        throw new Error("Professionnel non trouvé");
      }

      if (input.decision === "ACCEPTER") {
        // Marquer la demande comme acceptée
        await db
          .update(demandeAccesPatient)
          .set({ statut: "ACCEPTEE" })
          .where(eq(demandeAccesPatient.id, demande.id));

        // Créer le lien patient-professionnel s'il n'existe pas déjà
        const [existingLink] = await db
          .select()
          .from(patientProfessionnel)
          .where(
            and(
              eq(patientProfessionnel.patientId, demande.patientId),
              eq(patientProfessionnel.professionnelId, demande.professionnelId)
            )
          )
          .limit(1);

        if (!existingLink) {
          await db.insert(patientProfessionnel).values({
            patientId: demande.patientId,
            professionnelId: demande.professionnelId,
          });
        }

        // Notification pour le professionnel
        await db.insert(notification).values({
          professionnelId: prof.id,
          patientId: null,
          type: "SUCCESS",
          titre: "Accès au dossier accordé",
          message: `Le patient ${
            infoPatient?.prenom ?? ""
          } ${infoPatient?.nomUsage ?? ""} a accepté votre demande d'accès.`,
          lien: `/patient/${p.id}`,
        });

        // Mettre à jour la tâche associée à cette demande d'accès
        await db
          .update(tache)
          .set({ etat: "TERMINEE" })
          .where(
            and(
              eq(tache.patientId, demande.patientId),
              eq(tache.professionnelId, demande.professionnelId),
              eq(tache.typeDemarche, "ADMINISTRATIVE"),
              or(eq(tache.etat, "A_FAIRE"), eq(tache.etat, "EN_COURS"))
            )
          );
      } else {
        // REFUSER : marquer la demande comme refusée
        await db
          .update(demandeAccesPatient)
          .set({ statut: "REFUSEE" })
          .where(eq(demandeAccesPatient.id, demande.id));

        // Notification pour le professionnel
        await db.insert(notification).values({
          professionnelId: prof.id,
          patientId: null,
          type: "WARNING",
          titre: "Accès au dossier refusé",
          message: `Le patient ${
            infoPatient?.prenom ?? ""
          } ${infoPatient?.nomUsage ?? ""} a refusé votre demande d'accès.`,
          lien: null,
        });

        // Mettre à jour la tâche associée à cette demande d'accès
        await db
          .update(tache)
          .set({ etat: "ANNULEE" })
          .where(
            and(
              eq(tache.patientId, demande.patientId),
              eq(tache.professionnelId, demande.professionnelId),
              eq(tache.typeDemarche, "ADMINISTRATIVE"),
              or(eq(tache.etat, "A_FAIRE"), eq(tache.etat, "EN_COURS"))
            )
          );
      }

      return { success: true };
    }),

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

  // Récupérer les notifications du professionnel OU du particulier connecté
  listNotificationsByProfessionnel: protectedProcedure.handler(
    async ({ context }) => {
      if (!context.session?.user?.id) {
        throw new Error("Non authentifié");
      }

      const [userData] = await db
        .select()
        .from(user)
        .where(eq(user.id, context.session.user.id))
        .limit(1);

      if (!userData) {
        throw new Error("Utilisateur non trouvé");
      }

      let notificationsList: typeof notification.$inferSelect[] = [];

      if (userData.type === "PROFESSIONNEL") {
        const [prof] = await db
          .select()
          .from(professionnel)
          .where(eq(professionnel.userId, context.session.user.id))
          .limit(1);

        if (!prof) {
          throw new Error("Aucun professionnel associé à ce compte");
        }

        notificationsList = await db
          .select()
          .from(notification)
          .where(eq(notification.professionnelId, prof.id))
          .orderBy(desc(notification.createdAt));
      } else if (userData.type === "PARTICULIER") {
        const [part] = await db
          .select()
          .from(particulier)
          .where(eq(particulier.userId, context.session.user.id))
          .limit(1);

        if (!part) {
          throw new Error("Aucun particulier associé à ce compte");
        }

        notificationsList = await db
          .select()
          .from(notification)
          .where(eq(notification.patientId, part.patientId))
          .orderBy(desc(notification.createdAt));
      } else {
        throw new Error("Type d'utilisateur non supporté pour les notifications");
      }

      // Trier pour mettre les non lues en premier
      return notificationsList.sort((a, b) => {
        if (a.lue === b.lue) {
          return 0;
        }
        return a.lue ? 1 : -1;
      });
    }
  ),

  // Récupérer uniquement les notifications non lues du professionnel OU du particulier connecté
  listUnreadNotifications: protectedProcedure.handler(async ({ context }) => {
    if (!context.session?.user?.id) {
      throw new Error("Non authentifié");
    }

    const [userData] = await db
      .select()
      .from(user)
      .where(eq(user.id, context.session.user.id))
      .limit(1);

    if (!userData) {
      throw new Error("Utilisateur non trouvé");
    }

    if (userData.type === "PROFESSIONNEL") {
      const [prof] = await db
        .select()
        .from(professionnel)
        .where(eq(professionnel.userId, context.session.user.id))
        .limit(1);

      if (!prof) {
        throw new Error("Aucun professionnel associé à ce compte");
      }

      return await db
        .select()
        .from(notification)
        .where(
          and(
            eq(notification.professionnelId, prof.id),
            eq(notification.lue, false),
          ),
        )
        .orderBy(desc(notification.createdAt));
    }

    if (userData.type === "PARTICULIER") {
      const [part] = await db
        .select()
        .from(particulier)
        .where(eq(particulier.userId, context.session.user.id))
        .limit(1);

      if (!part) {
        throw new Error("Aucun particulier associé à ce compte");
      }

      return await db
        .select()
        .from(notification)
        .where(
          and(
            eq(notification.patientId, part.patientId),
            eq(notification.lue, false),
          ),
        )
        .orderBy(desc(notification.createdAt));
    }

    throw new Error("Type d'utilisateur non supporté pour les notifications");
  }),

  // Récupérer le nombre de notifications non lues pour le professionnel OU le particulier connecté
  getUnreadNotificationsCount: protectedProcedure.handler(
    async ({ context }) => {
      if (!context.session?.user?.id) {
        throw new Error("Non authentifié");
      }

      const [userData] = await db
        .select()
        .from(user)
        .where(eq(user.id, context.session.user.id))
        .limit(1);

      if (!userData) {
        throw new Error("Utilisateur non trouvé");
      }

      let unreadNotifications: typeof notification.$inferSelect[] = [];

      if (userData.type === "PROFESSIONNEL") {
        const [prof] = await db
          .select()
          .from(professionnel)
          .where(eq(professionnel.userId, context.session.user.id))
          .limit(1);

        if (!prof) {
          throw new Error("Aucun professionnel associé à ce compte");
        }

        unreadNotifications = await db
          .select()
          .from(notification)
          .where(
            and(
              eq(notification.professionnelId, prof.id),
              eq(notification.lue, false)
            )
          );
      } else if (userData.type === "PARTICULIER") {
        const [part] = await db
          .select()
          .from(particulier)
          .where(eq(particulier.userId, context.session.user.id))
          .limit(1);

        if (!part) {
          throw new Error("Aucun particulier associé à ce compte");
        }

        unreadNotifications = await db
          .select()
          .from(notification)
          .where(
            and(
              eq(notification.patientId, part.patientId),
              eq(notification.lue, false)
            )
          );
      } else {
        throw new Error("Type d'utilisateur non supporté pour les notifications");
      }

      return { count: unreadNotifications.length };
    }
  ),

  // Marquer une notification comme lue (pro ou particulier)
  markNotificationAsRead: protectedProcedure
    .input(z.object({ notificationId: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      if (!context.session?.user?.id) {
        throw new Error("Non authentifié");
      }

      const [userData] = await db
        .select()
        .from(user)
        .where(eq(user.id, context.session.user.id))
        .limit(1);

      if (!userData) {
        throw new Error("Utilisateur non trouvé");
      }

      const [notif] = await db
        .select()
        .from(notification)
        .where(eq(notification.id, input.notificationId))
        .limit(1);

      if (!notif) {
        throw new Error("Notification non trouvée");
      }

      if (userData.type === "PROFESSIONNEL") {
        const [prof] = await db
          .select()
          .from(professionnel)
          .where(eq(professionnel.userId, context.session.user.id))
          .limit(1);

        if (!prof || notif.professionnelId !== prof.id) {
          throw new Error("Notification non autorisée");
        }
      } else if (userData.type === "PARTICULIER") {
        const [part] = await db
          .select()
          .from(particulier)
          .where(eq(particulier.userId, context.session.user.id))
          .limit(1);

        if (!part || notif.patientId !== part.patientId) {
          throw new Error("Notification non autorisée");
        }
      } else {
        throw new Error("Type d'utilisateur non supporté pour les notifications");
      }

      await db
        .update(notification)
        .set({ lue: true })
        .where(eq(notification.id, input.notificationId));

      return { success: true };
    }),

  // Marquer toutes les notifications comme lues (pro ou particulier)
  markAllNotificationsAsRead: protectedProcedure.handler(async ({ context }) => {
    if (!context.session?.user?.id) {
      throw new Error("Non authentifié");
    }

    const [userData] = await db
      .select()
      .from(user)
      .where(eq(user.id, context.session.user.id))
      .limit(1);

    if (!userData) {
      throw new Error("Utilisateur non trouvé");
    }

    if (userData.type === "PROFESSIONNEL") {
      const [prof] = await db
        .select()
        .from(professionnel)
        .where(eq(professionnel.userId, context.session.user.id))
        .limit(1);

      if (!prof) {
        throw new Error("Aucun professionnel associé à ce compte");
      }

      await db
        .update(notification)
        .set({ lue: true })
        .where(
          and(
            eq(notification.professionnelId, prof.id),
            eq(notification.lue, false)
          )
        );
    } else if (userData.type === "PARTICULIER") {
      const [part] = await db
        .select()
        .from(particulier)
        .where(eq(particulier.userId, context.session.user.id))
        .limit(1);

      if (!part) {
        throw new Error("Aucun particulier associé à ce compte");
      }

      await db
        .update(notification)
        .set({ lue: true })
        .where(
          and(
            eq(notification.patientId, part.patientId),
            eq(notification.lue, false)
          )
        );
    } else {
      throw new Error("Type d'utilisateur non supporté pour les notifications");
    }

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

  // --- DEMANDES ---

  createDemande: protectedProcedure
    .input(
      z.object({
        typeDemande: z.enum([
          "APA",
          "CAF_AIDE_LOGEMENT",
          "RSA",
          "AAH",
          "MDPH",
          "ASH",
        ]),
        patientId: z.string().uuid().optional(),
        nomBeneficiaire: z.string().optional(),
        prenomBeneficiaire: z.string().optional(),
        details: z.string().optional(),
        donneesFormulaire: z.record(z.string(), z.record(z.string(), z.array(z.string()))).optional(),
      })
    )
    .handler(async ({ input, context }) => {
      if (!context.session?.user?.id) {
        throw new Error("Non authentifié");
      }

      const [userData] = await db
        .select()
        .from(user)
        .where(eq(user.id, context.session.user.id))
        .limit(1);

      if (!userData) {
        throw new Error("Utilisateur non trouvé");
      }

      let professionnelId: string | null = null;
      let particulierId: string | null = null;

      if (userData.type === "PROFESSIONNEL") {
        const [prof] = await db
          .select()
          .from(professionnel)
          .where(eq(professionnel.userId, context.session.user.id))
          .limit(1);

        if (!prof) {
          throw new Error("Aucun professionnel associé à ce compte");
        }

        professionnelId = prof.id;

        if (input.patientId) {
          const [link] = await db
            .select()
            .from(patientProfessionnel)
            .where(
              and(
                eq(patientProfessionnel.patientId, input.patientId),
                eq(patientProfessionnel.professionnelId, prof.id)
              )
            )
            .limit(1);

          if (!link) {
            throw new Error("Patient non trouvé ou non autorisé");
          }
        }
      } else if (userData.type === "PARTICULIER") {
        const [part] = await db
          .select()
          .from(particulier)
          .where(eq(particulier.userId, context.session.user.id))
          .limit(1);

        if (!part) {
          throw new Error("Aucun particulier associé à ce compte");
        }

        particulierId = part.id;
      } else {
        throw new Error("Type d'utilisateur non reconnu");
      }

      const [created] = await db
        .insert(demande)
        .values({
          professionnelId,
          patientId: input.patientId ?? null,
          particulierId,
          typeDemande: input.typeDemande,
          nomBeneficiaire: input.nomBeneficiaire ?? null,
          prenomBeneficiaire: input.prenomBeneficiaire ?? null,
          details: input.details ?? null,
          donneesFormulaire: input.donneesFormulaire ?? null,
        })
        .returning();

      const defaultSteps =
        backendStepsByDemandeType[created.typeDemande as keyof typeof backendStepsByDemandeType];

      if (defaultSteps && defaultSteps.length > 0) {
        await db.insert(demandeEtape).values(
          defaultSteps.map((step) => ({
            demandeId: created.id,
            stepCode: step.id,
            description: step.defaultDescription ?? step.label,
            statut: "A_FAIRE" as const,
            todos: step.defaultTodos ?? null,
          })),
        );
      }

      return created;
    }),

  listDemandes: protectedProcedure.handler(async ({ context }) => {
    if (!context.session?.user?.id) {
      throw new Error("Non authentifié");
    }

    const [userData] = await db
      .select()
      .from(user)
      .where(eq(user.id, context.session.user.id))
      .limit(1);

    if (!userData) {
      throw new Error("Utilisateur non trouvé");
    }

    let demandes: (typeof demande.$inferSelect)[] = [];

    if (userData.type === "PROFESSIONNEL") {
      const [prof] = await db
        .select()
        .from(professionnel)
        .where(eq(professionnel.userId, context.session.user.id))
        .limit(1);

      if (!prof) {
        throw new Error("Aucun professionnel associé à ce compte");
      }

      demandes = await db
        .select()
        .from(demande)
        .where(eq(demande.professionnelId, prof.id))
        .orderBy(desc(demande.createdAt));
    } else if (userData.type === "PARTICULIER") {
      const [part] = await db
        .select()
        .from(particulier)
        .where(eq(particulier.userId, context.session.user.id))
        .limit(1);

      if (!part) {
        throw new Error("Aucun particulier associé à ce compte");
      }

      demandes = await db
        .select()
        .from(demande)
        .where(eq(demande.particulierId, part.id))
        .orderBy(desc(demande.createdAt));
    } else {
      throw new Error("Type d'utilisateur non supporté");
    }

    // Enrichir avec les infos patient si lie
    const patientIds = demandes
      .map((d) => d.patientId)
      .filter((id): id is string => id !== null);

    let patientsMap = new Map<string, { prenom: string; nom: string }>();

    if (patientIds.length > 0) {
      const patients = await db
        .select()
        .from(patient)
        .where(inArray(patient.id, patientIds));

      const infoIds = patients.map((p) => p.informationIdentiteId);
      const infos = await db
        .select()
        .from(informationIdentite)
        .where(inArray(informationIdentite.id, infoIds));

      const infoById = new Map(infos.map((i) => [i.id, i]));

      for (const p of patients) {
        const info = infoById.get(p.informationIdentiteId);
        if (info) {
          patientsMap.set(p.id, {
            prenom: info.prenom,
            nom: info.nomUsage,
          });
        }
      }
    }

    const demandeIds = demandes.map((d) => d.id);

    let etapesMap = new Map<
      string,
      { stepCode: string; statut: string; description: string; todos: unknown }[]
    >();

    if (demandeIds.length > 0) {
      const etapes = await db
        .select()
        .from(demandeEtape)
        .where(inArray(demandeEtape.demandeId, demandeIds));

      for (const e of etapes) {
        const list = etapesMap.get(e.demandeId) ?? [];
        list.push({
          stepCode: e.stepCode,
          statut: e.statut,
          description: e.description,
          todos: e.todos,
        });
        etapesMap.set(e.demandeId, list);
      }
    }

    return demandes.map((d) => {
      const patientInfo = d.patientId ? patientsMap.get(d.patientId) : null;
      return {
        ...d,
        patientInfo: patientInfo ?? null,
        etapes: etapesMap.get(d.id) ?? [],
      };
    });
  }),

  getDemandeById: protectedProcedure
    .input(z.object({ demandeId: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      if (!context.session?.user?.id) {
        throw new Error("Non authentifié");
      }

      const [userData] = await db
        .select()
        .from(user)
        .where(eq(user.id, context.session.user.id))
        .limit(1);

      if (!userData) {
        throw new Error("Utilisateur non trouvé");
      }

      const [d] = await db
        .select()
        .from(demande)
        .where(eq(demande.id, input.demandeId))
        .limit(1);

      if (!d) {
        throw new Error("Demande non trouvée");
      }

      // Verification d'acces
      if (userData.type === "PROFESSIONNEL") {
        const [prof] = await db
          .select()
          .from(professionnel)
          .where(eq(professionnel.userId, context.session.user.id))
          .limit(1);

        if (!prof || d.professionnelId !== prof.id) {
          throw new Error("Demande non autorisée");
        }
      } else if (userData.type === "PARTICULIER") {
        const [part] = await db
          .select()
          .from(particulier)
          .where(eq(particulier.userId, context.session.user.id))
          .limit(1);

        const hasAccess =
          part &&
          (d.particulierId === part.id ||
            (d.patientId != null && d.patientId === part.patientId));

        if (!hasAccess) {
          throw new Error("Demande non autorisée");
        }
      } else {
        throw new Error("Type d'utilisateur non reconnu");
      }

      return d;
    }),

  listDemandeEtapes: protectedProcedure
    .input(z.object({ demandeId: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      if (!context.session?.user?.id) {
        throw new Error("Non authentifié");
      }

      const [userData] = await db
        .select()
        .from(user)
        .where(eq(user.id, context.session.user.id))
        .limit(1);

      if (!userData) {
        throw new Error("Utilisateur non trouvé");
      }

      const [d] = await db
        .select()
        .from(demande)
        .where(eq(demande.id, input.demandeId))
        .limit(1);

      if (!d) {
        throw new Error("Demande non trouvée");
      }

      if (userData.type === "PROFESSIONNEL") {
        const [prof] = await db
          .select()
          .from(professionnel)
          .where(eq(professionnel.userId, context.session.user.id))
          .limit(1);

        if (!prof || d.professionnelId !== prof.id) {
          throw new Error("Demande non autorisée");
        }
      } else if (userData.type === "PARTICULIER") {
        const [part] = await db
          .select()
          .from(particulier)
          .where(eq(particulier.userId, context.session.user.id))
          .limit(1);

        const hasAccess =
          part &&
          (d.particulierId === part.id ||
            (d.patientId != null && d.patientId === part.patientId));

        if (!hasAccess) {
          throw new Error("Demande non autorisée");
        }
      } else {
        throw new Error("Type d'utilisateur non reconnu");
      }

      const etapes = await db
        .select()
        .from(demandeEtape)
        .where(eq(demandeEtape.demandeId, input.demandeId));

      return etapes;
    }),

  upsertDemandeEtape: protectedProcedure
    .input(
      z.object({
        demandeId: z.string().uuid(),
        stepCode: z.string(),
        statut: z.enum(["A_FAIRE", "EN_COURS", "TERMINEE", "BLOQUEE"]).optional(),
        description: z.string().optional(),
        todos: z.any().optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      if (!context.session?.user?.id) {
        throw new Error("Non authentifié");
      }

      const [userData] = await db
        .select()
        .from(user)
        .where(eq(user.id, context.session.user.id))
        .limit(1);

      if (!userData) {
        throw new Error("Utilisateur non trouvé");
      }

      const [d] = await db
        .select()
        .from(demande)
        .where(eq(demande.id, input.demandeId))
        .limit(1);

      if (!d) {
        throw new Error("Demande non trouvée");
      }

      if (userData.type === "PROFESSIONNEL") {
        const [prof] = await db
          .select()
          .from(professionnel)
          .where(eq(professionnel.userId, context.session.user.id))
          .limit(1);

        if (!prof || d.professionnelId !== prof.id) {
          throw new Error("Demande non autorisée");
        }
      } else if (userData.type === "PARTICULIER") {
        const [part] = await db
          .select()
          .from(particulier)
          .where(eq(particulier.userId, context.session.user.id))
          .limit(1);

        const hasAccess =
          part &&
          (d.particulierId === part.id ||
            (d.patientId != null && d.patientId === part.patientId));

        if (!hasAccess) {
          throw new Error("Demande non autorisée");
        }
      } else {
        throw new Error("Type d'utilisateur non reconnu");
      }

      const [existing] = await db
        .select()
        .from(demandeEtape)
        .where(
          and(
            eq(demandeEtape.demandeId, input.demandeId),
            eq(demandeEtape.stepCode, input.stepCode),
          ),
        )
        .limit(1);

      const defaultsForType =
        backendStepsByDemandeType[d.typeDemande as keyof typeof backendStepsByDemandeType];
      const defaultStepDef = defaultsForType?.find(
        (s) => s.id === input.stepCode,
      );

      if (existing) {
        await db
          .update(demandeEtape)
          .set({
            statut: input.statut ?? existing.statut,
            description: input.description ?? existing.description,
            todos: input.todos ?? existing.todos,
          })
          .where(eq(demandeEtape.id, existing.id));

        const [updated] = await db
          .select()
          .from(demandeEtape)
          .where(eq(demandeEtape.id, existing.id))
          .limit(1);

        return updated;
      }

      const [createdEtape] = await db
        .insert(demandeEtape)
        .values({
          demandeId: input.demandeId,
          stepCode: input.stepCode,
          description:
            input.description ?? defaultStepDef?.label ?? input.stepCode,
          statut: input.statut ?? "A_FAIRE",
          todos: input.todos ?? null,
        })
        .returning();

      return createdEtape;
    }),

  updateDemandeStatut: protectedProcedure
    .input(
      z.object({
        demandeId: z.string().uuid(),
        statut: z.enum(["BROUILLON", "EN_COURS", "EN_ATTENTE_COMPLEMENT", "TERMINEE", "ANNULEE"]),
      })
    )
    .handler(async ({ input, context }) => {
      if (!context.session?.user?.id) {
        throw new Error("Non authentifié");
      }

      const [userData] = await db
        .select()
        .from(user)
        .where(eq(user.id, context.session.user.id))
        .limit(1);

      if (!userData) {
        throw new Error("Utilisateur non trouvé");
      }

      const [d] = await db
        .select()
        .from(demande)
        .where(eq(demande.id, input.demandeId))
        .limit(1);

      if (!d) {
        throw new Error("Demande non trouvée");
      }

      // Verification d'acces
      if (userData.type === "PROFESSIONNEL") {
        const [prof] = await db
          .select()
          .from(professionnel)
          .where(eq(professionnel.userId, context.session.user.id))
          .limit(1);

        if (!prof || d.professionnelId !== prof.id) {
          throw new Error("Demande non autorisée");
        }
      } else if (userData.type === "PARTICULIER") {
        const [part] = await db
          .select()
          .from(particulier)
          .where(eq(particulier.userId, context.session.user.id))
          .limit(1);

        if (!part || d.particulierId !== part.id) {
          throw new Error("Demande non autorisée");
        }
      } else {
        throw new Error("Type d'utilisateur non reconnu");
      }

      await db
        .update(demande)
        .set({ statut: input.statut })
        .where(eq(demande.id, input.demandeId));

      const [updated] = await db
        .select()
        .from(demande)
        .where(eq(demande.id, input.demandeId))
        .limit(1);

      return updated;
    }),

  listDemandesByPatient: protectedProcedure
    .input(z.object({ patientId: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      if (!context.session?.user?.id) {
        throw new Error("Non authentifié");
      }

      const [userData] = await db
        .select()
        .from(user)
        .where(eq(user.id, context.session.user.id))
        .limit(1);

      if (!userData) {
        throw new Error("Utilisateur non trouvé");
      }

      if (userData.type === "PROFESSIONNEL") {
        const [prof] = await db
          .select()
          .from(professionnel)
          .where(eq(professionnel.userId, context.session.user.id))
          .limit(1);

        if (!prof) {
          throw new Error("Aucun professionnel associé à ce compte");
        }

        const [link] = await db
          .select()
          .from(patientProfessionnel)
          .where(
            and(
              eq(patientProfessionnel.patientId, input.patientId),
              eq(patientProfessionnel.professionnelId, prof.id)
            )
          )
          .limit(1);

        if (!link) {
          throw new Error("Patient non trouvé ou non autorisé");
        }
      } else if (userData.type === "PARTICULIER") {
        const [part] = await db
          .select()
          .from(particulier)
          .where(eq(particulier.userId, context.session.user.id))
          .limit(1);

        if (!part) {
          throw new Error("Aucun particulier associé à ce compte");
        }

        if (part.patientId !== input.patientId) {
          throw new Error("Patient non autorisé");
        }
      } else {
        throw new Error("Type d'utilisateur non reconnu");
      }

      const demandes = await db
        .select()
        .from(demande)
        .where(eq(demande.patientId, input.patientId))
        .orderBy(desc(demande.createdAt));

      // Enrichir avec les noms des professionnels
      const profIds = demandes
        .map((d) => d.professionnelId)
        .filter((id): id is string => id !== null);

      let profsMap = new Map<string, { prenom: string; nom: string; fonction: string }>();

      if (profIds.length > 0) {
        const profs = await db
          .select()
          .from(professionnel)
          .where(inArray(professionnel.id, profIds));

        for (const p of profs) {
          profsMap.set(p.id, {
            prenom: p.prenom,
            nom: p.nom,
            fonction: p.fonction,
          });
        }
      }

      // Enrichir avec les étapes de chaque demande
      const demandeIds = demandes.map((d) => d.id);

      let etapesMap = new Map<
        string,
        { stepCode: string; statut: string; description: string; todos: unknown }[]
      >();

      if (demandeIds.length > 0) {
        const etapes = await db
          .select()
          .from(demandeEtape)
          .where(inArray(demandeEtape.demandeId, demandeIds));

        for (const e of etapes) {
          const list = etapesMap.get(e.demandeId) ?? [];
          list.push({
            stepCode: e.stepCode,
            statut: e.statut,
            description: e.description,
            todos: e.todos,
          });
          etapesMap.set(e.demandeId, list);
        }
      }

      return demandes.map((d) => ({
        ...d,
        professionnelInfo: d.professionnelId
          ? profsMap.get(d.professionnelId) ?? null
          : null,
        etapes: etapesMap.get(d.id) ?? [],
      }));
    }),

  demanderComplementDemande: protectedProcedure
    .input(
      z.object({
        demandeId: z.string().uuid(),
        commentaire: z.string().min(1),
      })
    )
    .handler(async ({ input, context }) => {
      if (!context.session?.user?.id) {
        throw new Error("Non authentifié");
      }

      const [userData] = await db
        .select()
        .from(user)
        .where(eq(user.id, context.session.user.id))
        .limit(1);

      if (!userData || userData.type !== "PROFESSIONNEL") {
        throw new Error("Seul un professionnel peut demander un complément");
      }

      const [prof] = await db
        .select()
        .from(professionnel)
        .where(eq(professionnel.userId, context.session.user.id))
        .limit(1);

      if (!prof) {
        throw new Error("Aucun professionnel associé à ce compte");
      }

      const [d] = await db
        .select()
        .from(demande)
        .where(eq(demande.id, input.demandeId))
        .limit(1);

      if (!d) {
        throw new Error("Demande non trouvée");
      }

      if (d.professionnelId !== prof.id) {
        throw new Error("Demande non autorisée");
      }

      if (!d.patientId) {
        throw new Error("Impossible de demander un complément sans patient lié à la demande");
      }

      await db
        .update(demande)
        .set({
          statut: "EN_ATTENTE_COMPLEMENT",
          commentaireComplement: input.commentaire,
          reponseComplement: null,
        })
        .where(eq(demande.id, input.demandeId));

      let patientNom = "le patient";
      const [patientData] = await db
        .select()
        .from(patient)
        .where(eq(patient.id, d.patientId))
        .limit(1);

      if (patientData?.informationIdentiteId) {
        const [info] = await db
          .select()
          .from(informationIdentite)
          .where(eq(informationIdentite.id, patientData.informationIdentiteId))
          .limit(1);
        if (info) {
          patientNom = `${info.prenom} ${info.nomUsage}`;
        }
      }

      await db.insert(notification).values({
        patientId: d.patientId,
        professionnelId: null,
        type: "INFO",
        titre: "Complément d'informations requis",
        message: `Le professionnel ${prof.prenom} ${prof.nom} demande un complément d'informations pour une demande ${d.typeDemande}. Message : "${input.commentaire}"`,
        lien: "/mes-informations",
      });

      await db.insert(tache).values({
        patientId: d.patientId,
        professionnelId: prof.id,
        typeDemarche: "ADMINISTRATIVE",
        etat: "A_FAIRE",
        date: new Date(),
        details: `Complément d'informations demandé pour la demande ${d.typeDemande} du patient ${patientNom}. En attente de réponse.`,
      });

      const [updated] = await db
        .select()
        .from(demande)
        .where(eq(demande.id, input.demandeId))
        .limit(1);

      return updated;
    }),

  completerDemande: protectedProcedure
    .input(
      z.object({
        demandeId: z.string().uuid(),
        nomBeneficiaire: z.string().optional(),
        prenomBeneficiaire: z.string().optional(),
        details: z.string().optional(),
        reponseComplement: z.string().optional(),
      })
    )
    .handler(async ({ input, context }) => {
      if (!context.session?.user?.id) {
        throw new Error("Non authentifié");
      }

      const [userData] = await db
        .select()
        .from(user)
        .where(eq(user.id, context.session.user.id))
        .limit(1);

      if (!userData) {
        throw new Error("Utilisateur non trouvé");
      }

      const [d] = await db
        .select()
        .from(demande)
        .where(eq(demande.id, input.demandeId))
        .limit(1);

      if (!d) {
        throw new Error("Demande non trouvée");
      }

      const updateData: Record<string, unknown> = {};
      if (input.nomBeneficiaire !== undefined) updateData.nomBeneficiaire = input.nomBeneficiaire;
      if (input.prenomBeneficiaire !== undefined) updateData.prenomBeneficiaire = input.prenomBeneficiaire;
      if (input.details !== undefined) updateData.details = input.details;

      if (userData.type === "PARTICULIER") {
        const [part] = await db
          .select()
          .from(particulier)
          .where(eq(particulier.userId, context.session.user.id))
          .limit(1);

        if (!part) {
          throw new Error("Aucun particulier associé à ce compte");
        }

        if (d.patientId !== part.patientId) {
          throw new Error("Demande non autorisée");
        }

        if (d.statut !== "EN_ATTENTE_COMPLEMENT") {
          throw new Error("Cette demande n'est pas en attente de complément");
        }

        updateData.statut = "EN_COURS";
        if (input.reponseComplement !== undefined) {
          updateData.reponseComplement = input.reponseComplement;
        }

        await db
          .update(demande)
          .set(updateData)
          .where(eq(demande.id, input.demandeId));

        if (d.professionnelId) {
          let patientNom = "le patient";
          if (d.patientId) {
            const [patientData] = await db
              .select()
              .from(patient)
              .where(eq(patient.id, d.patientId))
              .limit(1);

            if (patientData?.informationIdentiteId) {
              const [info] = await db
                .select()
                .from(informationIdentite)
                .where(eq(informationIdentite.id, patientData.informationIdentiteId))
                .limit(1);
              if (info) {
                patientNom = `${info.prenom} ${info.nomUsage}`;
              }
            }
          }

          await db.insert(notification).values({
            professionnelId: d.professionnelId,
            patientId: null,
            type: "INFO",
            titre: "Complément d'informations reçu",
            message: `Le patient ${patientNom} a complété les informations demandées pour la demande ${d.typeDemande}.`,
            lien: "/mes-demandes",
          });

          if (d.patientId) {
            const matchingTaches = await db
              .select()
              .from(tache)
              .where(
                and(
                  eq(tache.patientId, d.patientId),
                  eq(tache.professionnelId, d.professionnelId),
                  eq(tache.etat, "A_FAIRE")
                )
              );

            for (const t of matchingTaches) {
              if (t.details?.includes("Complément d'informations demandé")) {
                await db
                  .update(tache)
                  .set({ etat: "TERMINEE" })
                  .where(eq(tache.id, t.id));
                break;
              }
            }
          }
        }
      } else if (userData.type === "PROFESSIONNEL") {
        const [prof] = await db
          .select()
          .from(professionnel)
          .where(eq(professionnel.userId, context.session.user.id))
          .limit(1);

        if (!prof || d.professionnelId !== prof.id) {
          throw new Error("Demande non autorisée");
        }

        await db
          .update(demande)
          .set(updateData)
          .where(eq(demande.id, input.demandeId));
      } else {
        throw new Error("Type d'utilisateur non reconnu");
      }

      const [updated] = await db
        .select()
        .from(demande)
        .where(eq(demande.id, input.demandeId))
        .limit(1);

      return updated;
    }),

  updateDemande: protectedProcedure
    .input(
      z.object({
        demandeId: z.string().uuid(),
        nomBeneficiaire: z.string().optional(),
        prenomBeneficiaire: z.string().optional(),
        details: z.string().optional(),
        donneesFormulaire: z.record(z.string(), z.record(z.string(), z.array(z.string()))).optional(),
      })
    )
    .handler(async ({ input, context }) => {
      if (!context.session?.user?.id) {
        throw new Error("Non authentifié");
      }

      const [userData] = await db
        .select()
        .from(user)
        .where(eq(user.id, context.session.user.id))
        .limit(1);

      if (!userData) {
        throw new Error("Utilisateur non trouvé");
      }

      const [d] = await db
        .select()
        .from(demande)
        .where(eq(demande.id, input.demandeId))
        .limit(1);

      if (!d) {
        throw new Error("Demande non trouvée");
      }

      if (userData.type === "PROFESSIONNEL") {
        const [prof] = await db
          .select()
          .from(professionnel)
          .where(eq(professionnel.userId, context.session.user.id))
          .limit(1);

        if (!prof || d.professionnelId !== prof.id) {
          throw new Error("Demande non autorisée");
        }
      } else if (userData.type === "PARTICULIER") {
        const [part] = await db
          .select()
          .from(particulier)
          .where(eq(particulier.userId, context.session.user.id))
          .limit(1);

        const hasAccess =
          part &&
          (d.particulierId === part.id ||
            (d.patientId != null && d.patientId === part.patientId));

        if (!hasAccess) {
          throw new Error("Demande non autorisée");
        }
      } else {
        throw new Error("Type d'utilisateur non reconnu");
      }

      const updateData: Record<string, unknown> = {};
      if (input.nomBeneficiaire !== undefined) updateData.nomBeneficiaire = input.nomBeneficiaire;
      if (input.prenomBeneficiaire !== undefined) updateData.prenomBeneficiaire = input.prenomBeneficiaire;
      if (input.details !== undefined) updateData.details = input.details;
      if (input.donneesFormulaire !== undefined) updateData.donneesFormulaire = input.donneesFormulaire;

      await db
        .update(demande)
        .set(updateData)
        .where(eq(demande.id, input.demandeId));

      const [updated] = await db
        .select()
        .from(demande)
        .where(eq(demande.id, input.demandeId))
        .limit(1);

      return updated;
    }),
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
