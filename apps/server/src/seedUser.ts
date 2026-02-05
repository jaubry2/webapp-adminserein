import { db, user } from "@webapp-adminserein/db";
import { eq } from "drizzle-orm";
import { auth } from "@webapp-adminserein/auth";

// Identifiants de test simples
const TEST_USER = {
  name: "Test User",
  email: "test@test.com",
  password: "test1234", // Mot de passe simple pour le dev
};

/**
 * Crée un utilisateur de test s'il n'existe pas déjà
 * Identifiants : test@test.com / test123
 */
export async function seedTestUser() {
  // Vérifier si l'utilisateur existe déjà
  const existing = await db
    .select()
    .from(user)
    .where(eq(user.email, TEST_USER.email))
    .limit(1);

  if (existing.length > 0) {
    console.log(`✅ Utilisateur de test déjà existant : ${TEST_USER.email}`);
    return;
  }

  try {
    // Utiliser l'API Better Auth pour créer l'utilisateur
    const result = await auth.api.signUpEmail({
      body: {
        name: TEST_USER.name,
        email: TEST_USER.email,
        password: TEST_USER.password,
      },
    });

    if (result.error) {
      if (
        result.error.message?.includes("already exists") ||
        result.error.message?.includes("unique")
      ) {
        console.log(`✅ Utilisateur de test déjà existant : ${TEST_USER.email}`);
        return;
      }
      throw new Error(result.error.message);
    }

    console.log(`✅ Utilisateur de test créé avec succès !`);
    console.log(`📧 Email: ${TEST_USER.email}`);
    console.log(`🔑 Mot de passe: ${TEST_USER.password}`);
    console.log(`👤 ID: ${result.data?.user?.id || "N/A"}`);
  } catch (error: any) {
    if (
      error?.code === "23505" ||
      error?.message?.includes("unique") ||
      error?.message?.includes("already exists")
    ) {
      console.log(`✅ Utilisateur de test déjà existant : ${TEST_USER.email}`);
      return;
    }
    console.error("❌ Erreur lors de la création de l'utilisateur de test:", error);
    throw error;
  }
}
