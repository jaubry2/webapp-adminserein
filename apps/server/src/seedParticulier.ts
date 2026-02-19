import { db, particulier, patient, user, informationIdentite } from "@webapp-adminserein/db";
import { eq } from "drizzle-orm";

// Identifiants de test pour les particuliers
const TEST_PARTICULIERS = [
  {
    name: "Marie Dupont",
    email: "marie.dupont@test.com",
    password: "test1234",
    patientNumeroDossier: "0000-0001",
  },
  {
    name: "Jean Martin",
    email: "jean.martin@test.com",
    password: "test1234",
    patientNumeroDossier: "0000-0002",
  },
];

/**
 * Crée plusieurs utilisateurs particuliers de test et les lie à des patients existants
 * S'exécute après la création des patients
 */
export async function seedParticulierIfEmpty() {
  // Récupérer tous les patients existants
  const allPatients = await db.select().from(patient);

  if (allPatients.length === 0) {
    console.log("⏳ Aucun patient disponible pour créer des particuliers");
    return;
  }

  const { auth } = await import("@webapp-adminserein/auth");
  let createdCount = 0;
  let skippedCount = 0;

  for (const testParticulier of TEST_PARTICULIERS) {
    // Trouver le patient correspondant au numéro de dossier
    const targetPatient = allPatients.find(
      (p) => p.numeroDossier === testParticulier.patientNumeroDossier
    );

    if (!targetPatient) {
      console.log(
        `⚠️  Patient ${testParticulier.patientNumeroDossier} non trouvé pour ${testParticulier.email}`
      );
      continue;
    }

    // Vérifier si le particulier existe déjà pour ce patient
    const [existingParticulier] = await db
      .select()
      .from(particulier)
      .where(eq(particulier.patientId, targetPatient.id))
      .limit(1);

    if (existingParticulier) {
      console.log(
        `⏭️  Particulier déjà existant pour le patient ${testParticulier.patientNumeroDossier}`
      );
      skippedCount++;
      continue;
    }

    // Vérifier si l'utilisateur existe déjà
    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, testParticulier.email))
      .limit(1);

    let particulierUser;

    if (existingUser) {
      // Mettre à jour le type de l'utilisateur existant
      await db
        .update(user)
        .set({ type: "PARTICULIER" })
        .where(eq(user.id, existingUser.id));
      particulierUser = existingUser;
      console.log(`✅ Utilisateur particulier existant mis à jour : ${testParticulier.email}`);
    } else {
      // Créer un nouvel utilisateur particulier
      try {
        const result = await auth.api.signUpEmail({
          body: {
            name: testParticulier.name,
            email: testParticulier.email,
            password: testParticulier.password,
          },
        });

        if (result.error) {
          if (
            result.error.message?.includes("already exists") ||
            result.error.message?.includes("unique")
          ) {
            // L'utilisateur existe déjà, le récupérer
            const [existing] = await db
              .select()
              .from(user)
              .where(eq(user.email, testParticulier.email))
              .limit(1);
            if (existing) {
              await db
                .update(user)
                .set({ type: "PARTICULIER" })
                .where(eq(user.id, existing.id));
              particulierUser = existing;
            } else {
              console.log(`⚠️  Impossible de créer l'utilisateur particulier : ${testParticulier.email}`);
              continue;
            }
          } else {
            console.error(
              `❌ Erreur lors de la création de l'utilisateur ${testParticulier.email}:`,
              result.error.message
            );
            continue;
          }
        } else {
          // Mettre à jour le type de l'utilisateur créé
          if (result.data?.user?.id) {
            await db
              .update(user)
              .set({ type: "PARTICULIER" })
              .where(eq(user.id, result.data.user.id));
            const [created] = await db
              .select()
              .from(user)
              .where(eq(user.id, result.data.user.id))
              .limit(1);
            particulierUser = created;
            console.log(`✅ Utilisateur particulier créé : ${testParticulier.email}`);
          }
        }
      } catch (error: any) {
        console.error(
          `❌ Erreur lors de la création de l'utilisateur particulier ${testParticulier.email}:`,
          error
        );
        continue;
      }
    }

    if (!particulierUser) {
      console.log(`⚠️  Impossible de créer ou récupérer l'utilisateur particulier : ${testParticulier.email}`);
      continue;
    }

    // Vérifier si le particulier existe déjà pour cet utilisateur
    const [existingParticulierForUser] = await db
      .select()
      .from(particulier)
      .where(eq(particulier.userId, particulierUser.id))
      .limit(1);

    if (existingParticulierForUser) {
      console.log(`⏭️  Particulier déjà existant pour l'utilisateur ${testParticulier.email}`);
      skippedCount++;
      continue;
    }

    // Créer le particulier lié à l'utilisateur et au patient
    await db.insert(particulier).values({
      userId: particulierUser.id,
      patientId: targetPatient.id,
    });

    // Récupérer les informations du patient pour l'affichage
    const [patientInfo] = await db
      .select()
      .from(informationIdentite)
      .where(eq(informationIdentite.id, targetPatient.informationIdentiteId))
      .limit(1);

    const patientName = patientInfo
      ? `${patientInfo.prenom} ${patientInfo.nomUsage}`
      : targetPatient.numeroDossier;

    console.log(
      `✅ Particulier créé : ${testParticulier.name} (${testParticulier.email}) → Patient ${patientName} (${targetPatient.numeroDossier})`
    );
    createdCount++;
  }

  console.log(`\n📊 Résumé : ${createdCount} particulier(s) créé(s), ${skippedCount} ignoré(s)`);
  if (createdCount > 0) {
    console.log(`\n📋 Identifiants de test :`);
    TEST_PARTICULIERS.forEach((p) => {
      console.log(`   📧 ${p.email} / 🔑 ${p.password}`);
    });
  }
}
