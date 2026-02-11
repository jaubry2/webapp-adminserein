import type { RouterClient } from "@orpc/server";
import { eq, and, inArray, or, desc } from "drizzle-orm";
import { z } from "zod";

import {
  db,
  informationIdentite,
  informationCoordonnee,
  patient,
  professionnel,
  patientProfessionnel,
  tache,
  document,
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

      return {
        success: true,
        notification: nombreTachesNonTerminees > 0
          ? {
              type: "warning" as const,
              message: `Le patient ${patientNom} a été retiré de votre liste. ${nombreTachesNonTerminees} tâche(s) non terminée(s) ${nombreTachesNonTerminees > 1 ? "ont été" : "a été"} supprimée(s).`,
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

  // Récupérer le professionnel connecté
  getCurrentProfessionnel: protectedProcedure.handler(async ({ context }) => {
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

    return prof;
  }),

  // --- DOCUMENTS ---

  // Récupérer les documents d'un patient spécifique
  listDocumentsByPatient: protectedProcedure
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

      // Récupérer les documents du patient, triés par date de création (plus récent en premier)
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
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
