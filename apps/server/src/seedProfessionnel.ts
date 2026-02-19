import { db, professionnel, patientProfessionnel, patient } from "@webapp-adminserein/db";
import { eq, and } from "drizzle-orm";

/**
 * Crée un professionnel de test et lie les patients de démo à ce professionnel
 * S'exécute après la création de l'utilisateur de test
 */
export async function seedProfessionnel() {
  // Récupérer l'utilisateur de test (test@test.com)
  const { user } = await import("@webapp-adminserein/db/schema/auth");
  const [testUser] = await db
    .select()
    .from(user)
    .where(eq(user.email, "test@test.com"))
    .limit(1);

  if (!testUser) {
    console.log("⏳ Utilisateur de test non trouvé, professionnel sera créé après");
    return;
  }

  // Mettre à jour le type de l'utilisateur à PROFESSIONNEL s'il n'est pas déjà défini
  if (!testUser.type || testUser.type !== "PROFESSIONNEL") {
    await db
      .update(user)
      .set({ type: "PROFESSIONNEL" })
      .where(eq(user.id, testUser.id));
    console.log(`✅ Type utilisateur mis à jour à PROFESSIONNEL pour ${testUser.email}`);
  }

  // Vérifier si le professionnel existe déjà
  const [existing] = await db
    .select()
    .from(professionnel)
    .where(eq(professionnel.userId, testUser.id))
    .limit(1);

  if (existing) {
    console.log(`✅ Professionnel de test déjà existant pour ${testUser.email}`);
    return;
  }

  // Créer le professionnel de test
  const [createdProf] = await db
    .insert(professionnel)
    .values({
      userId: testUser.id,
      nom: "Test",
      prenom: "Assistante",
      fonction: "Assistante sociale",
    })
    .returning();

  console.log(`✅ Professionnel de test créé : ${createdProf.prenom} ${createdProf.nom}`);

  // Récupérer tous les patients existants
  const allPatients = await db.select().from(patient);

  if (allPatients.length === 0) {
    console.log("ℹ️  Aucun patient à lier au professionnel");
    return;
  }

  // Lier tous les patients au professionnel de test
  for (const p of allPatients) {
    // Vérifier si la liaison existe déjà
    const [existingLink] = await db
      .select()
      .from(patientProfessionnel)
      .where(
        and(
          eq(patientProfessionnel.patientId, p.id),
          eq(patientProfessionnel.professionnelId, createdProf.id)
        )
      )
      .limit(1);

    if (!existingLink) {
      await db.insert(patientProfessionnel).values({
        patientId: p.id,
        professionnelId: createdProf.id,
      });
    }
  }

  console.log(
    `✅ ${allPatients.length} patient(s) lié(s) au professionnel de test`
  );
}
