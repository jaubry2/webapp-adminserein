import { db, tache, patient, professionnel } from "@webapp-adminserein/db";
import { eq } from "drizzle-orm";

/**
 * Crée des tâches de démonstration au démarrage
 * Utilise les patients et professionnels existants
 */
export async function seedTachesIfEmpty() {
  // Vérifier s'il y a déjà des tâches
  const existing = await db.select().from(tache).limit(1);
  if (existing.length > 0) {
    console.log("✅ Des tâches existent déjà, pas de création");
    return;
  }

  // Récupérer tous les patients
  const patients = await db.select().from(patient);
  if (patients.length === 0) {
    console.log("ℹ️  Aucun patient disponible pour créer des tâches");
    return;
  }

  // Récupérer tous les professionnels
  const professionnels = await db.select().from(professionnel);
  if (professionnels.length === 0) {
    console.log("ℹ️  Aucun professionnel disponible pour créer des tâches");
    return;
  }

  // Utiliser le premier professionnel disponible
  const prof = professionnels[0];

  // Créer des tâches de démonstration pour chaque patient
  const demoTaches = [
    {
      patientId: patients[0].id,
      professionnelId: prof.id,
      typeDemarche: "ADMINISTRATIVE" as const,
      etat: "A_FAIRE" as const,
      date: new Date(),
      details: "Demande d'aide au logement (APL) - Dossier à compléter et envoyer à la CAF",
    },
    {
      patientId: patients[0].id,
      professionnelId: prof.id,
      typeDemarche: "SOCIALE" as const,
      etat: "EN_COURS" as const,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Il y a 2 jours
      details: "Accompagnement pour la recherche d'emploi - Suivi des candidatures en cours",
    },
    {
      patientId: patients.length > 1 ? patients[1].id : patients[0].id,
      professionnelId: prof.id,
      typeDemarche: "MEDICALE" as const,
      etat: "TERMINEE" as const,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Il y a 7 jours
      details: "Renouvellement de la carte vitale - Dossier complété et envoyé",
    },
    {
      patientId: patients.length > 1 ? patients[1].id : patients[0].id,
      professionnelId: prof.id,
      typeDemarche: "LOGEMENT" as const,
      etat: "A_FAIRE" as const,
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Dans 3 jours
      details: "Visite d'appartement - Rendez-vous programmé avec le bailleur social",
    },
    {
      patientId: patients[0].id,
      professionnelId: prof.id,
      typeDemarche: "JURIDIQUE" as const,
      etat: "EN_COURS" as const,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Il y a 1 jour
      details: "Demande d'aide juridictionnelle - Dossier en cours d'instruction",
    },
    {
      patientId: patients.length > 1 ? patients[1].id : patients[0].id,
      professionnelId: prof.id,
      typeDemarche: "EMPLOI" as const,
      etat: "A_FAIRE" as const,
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Dans 5 jours
      details: "Formation professionnelle - Inscription à un programme de requalification",
    },
  ];

  for (const demo of demoTaches) {
    await db.insert(tache).values(demo);
  }

  console.log(`✅ ${demoTaches.length} tâche(s) de démonstration créée(s)`);
}
