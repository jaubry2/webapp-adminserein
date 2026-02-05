import { db, informationIdentite, patient } from "@webapp-adminserein/db";
import { eq } from "drizzle-orm";

// Création de quelques patients de démonstration au démarrage
export async function seedPatientsIfEmpty() {
  const existing = await db.select().from(patient).limit(1);
  if (existing.length > 0) {
    return;
  }

  const demoPatients = [
    {
      numeroDossier: "0000-0001",
      informationIdentite: {
        nomUsage: "DUPONT",
        nomNaissance: "DUPONT",
        prenom: "Marie",
        autresPrenoms: ["Claire"],
        genre: "FEMININ" as const,
        dateNaissance: new Date("1990-01-15"),
        villeNaissance: "Paris",
        departementNaissance: "75",
        paysNaissance: "France",
        nationalites: ["Française"],
        numeroSecuriteSociale: "2900115123456",
        situationFamiliale: "CELIBATAIRE" as const,
      },
    },
    {
      numeroDossier: "0000-0002",
      informationIdentite: {
        nomUsage: "MARTIN",
        nomNaissance: "MARTIN",
        prenom: "Jean",
        autresPrenoms: [],
        genre: "MASCULIN" as const,
        dateNaissance: new Date("1985-06-30"),
        villeNaissance: "Lyon",
        departementNaissance: "69",
        paysNaissance: "France",
        nationalites: ["Française"],
        numeroSecuriteSociale: "1850630123456",
        situationFamiliale: "MARIE" as const,
      },
    },
  ];

  for (const demo of demoPatients) {
    const [info] = await db
      .insert(informationIdentite)
      .values(demo.informationIdentite)
      .returning();

    await db.insert(patient).values({
      numeroDossier: demo.numeroDossier,
      informationIdentiteId: info.id,
    });
  }
}

