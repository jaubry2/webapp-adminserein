import {
  db,
  informationIdentite,
  informationCoordonnee,
  patient,
} from "@webapp-adminserein/db";

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
        dateNaissance: "1990-01-15",
        villeNaissance: "Paris",
        departementNaissance: "75",
        paysNaissance: "France",
        nationalites: ["Française"],
        numeroSecuriteSociale: "2900115123456",
        situationFamiliale: "CELIBATAIRE" as const,
      },
      informationCoordonnee: {
        adresse: "123 Rue de la République",
        informationComplementaires: "Appartement 4B",
        codePostal: "75001",
        ville: "Paris",
        departement: "75",
        pays: "France",
        numeroTelephone: "0612345678",
        adresseMail: "marie.dupont@example.com",
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
        dateNaissance: "1985-06-30",
        villeNaissance: "Lyon",
        departementNaissance: "69",
        paysNaissance: "France",
        nationalites: ["Française"],
        numeroSecuriteSociale: "1850630123456",
        situationFamiliale: "MARIE" as const,
      },
      informationCoordonnee: {
        adresse: "45 Avenue des Champs-Élysées",
        informationComplementaires: "",
        codePostal: "69001",
        ville: "Lyon",
        departement: "69",
        pays: "France",
        numeroTelephone: "0698765432",
        adresseMail: "jean.martin@example.com",
      },
    },
  ];

  for (const demo of demoPatients) {
    const infoResult = await db
      .insert(informationIdentite)
      .values(demo.informationIdentite)
      .returning();

    const coordonneeResult = await db
      .insert(informationCoordonnee)
      .values(demo.informationCoordonnee)
      .returning();

    const info = infoResult[0];
    const coordonnee = coordonneeResult[0];

    if (!info || !coordonnee) {
      throw new Error("Erreur lors de la création des données de démonstration");
    }

    await db.insert(patient).values({
      numeroDossier: demo.numeroDossier,
      informationIdentiteId: info.id,
      informationCoordonneeId: coordonnee.id,
    });
  }
}

