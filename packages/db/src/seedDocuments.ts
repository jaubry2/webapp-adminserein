import { db, document, patient, informationIdentite } from "@webapp-adminserein/db";
import { eq } from "drizzle-orm";
import { existsSync, statSync } from "fs";
import { join, extname, dirname, resolve } from "path";
import { fileURLToPath } from "url";

/**
 * Crée des documents de démonstration au démarrage
 * Associe les fichiers du dossier public/document aux patients
 */
export async function seedDocumentsIfEmpty() {
  // Vérifier s'il y a déjà des documents
  const existing = await db.select().from(document).limit(1);
  if (existing.length > 0) {
    console.log("✅ Des documents existent déjà, pas de création");
    return;
  }

  // Récupérer tous les patients avec leurs informations d'identité
  const patients = await db
    .select({
      patient: patient,
      info: informationIdentite,
    })
    .from(patient)
    .innerJoin(
      informationIdentite,
      eq(patient.informationIdentiteId, informationIdentite.id)
    );

  if (patients.length === 0) {
    console.log("ℹ️  Aucun patient disponible pour créer des documents");
    return;
  }

  // Définir les documents disponibles dans public/document
  // Obtenir le chemin de la racine du projet
  // Le script est dans packages/db/src/, donc on remonte de 3 niveaux pour arriver à la racine
  let projectRoot: string;
  try {
    // Essayer avec import.meta.url (ESM)
    const currentFile = fileURLToPath(import.meta.url);
    const currentDir = dirname(currentFile);
    projectRoot = resolve(currentDir, "../../..");
  } catch {
    // Fallback: utiliser process.cwd() et chercher depuis la racine
    // Si on est dans packages/db/src, on remonte de 3 niveaux
    projectRoot = resolve(process.cwd());
    // Si on n'est pas à la racine, essayer de remonter
    if (!existsSync(join(projectRoot, "apps/web/public/document"))) {
      projectRoot = resolve(projectRoot, "../..");
    }
  }
  
  const documentsDir = join(projectRoot, "apps/web/public/document");
  
  console.log(`📁 Recherche des documents dans: ${documentsDir}`);
  console.log(`📁 Racine du projet: ${projectRoot}`);

  // Liste des fichiers disponibles
  const documentFiles = [
    {
      filename: "attestation_assurance.jpg",
      nom: "Attestation d'assurance",
      categorie: "ADMINISTRATIF" as const,
      description: "Attestation d'assurance maladie",
    },
    {
      filename: "AUBRY_Jules.pdf",
      nom: "Document AUBRY Jules",
      categorie: "IDENTITE" as const,
      description: "Document d'identité - AUBRY Jules",
    },
    {
      filename: "Capture d'écran 2026-01-16 à 15.18.40.png",
      nom: "Capture d'écran",
      categorie: "AUTRE" as const,
      description: "Capture d'écran du 16 janvier 2026",
    },
  ];

  // Fonction pour obtenir le type MIME d'un fichier
  const getMimeType = (filename: string): string => {
    const ext = extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".xls": "application/vnd.ms-excel",
      ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
    return mimeTypes[ext] || "application/octet-stream";
  };

  // Fonction pour obtenir la taille d'un fichier
  const getFileSize = (filePath: string): string => {
    try {
      const stats = statSync(filePath);
      return stats.size.toString();
    } catch (error) {
      console.warn(`Impossible de lire la taille du fichier ${filePath}`);
      return "0";
    }
  };

  // Associer les documents aux patients
  // On cherche le patient "AUBRY Jules" pour le PDF, sinon on prend le premier patient
  let targetPatient = patients[0];
  const aubryPatient = patients.find(
    (p) =>
      p.info.nomUsage.toUpperCase() === "AUBRY" &&
      p.info.prenom.toUpperCase() === "JULES"
  );
  if (aubryPatient) {
    targetPatient = aubryPatient;
  }

  const documentsToCreate = [];

  for (const docFile of documentFiles) {
    const filePath = join(documentsDir, docFile.filename);
    
    // Vérifier que le fichier existe
    if (!existsSync(filePath)) {
      console.warn(`⚠️  Fichier non trouvé: ${docFile.filename}`);
      console.warn(`   Chemin recherché: ${filePath}`);
      continue;
    }
    
    console.log(`✅ Fichier trouvé: ${docFile.filename}`);

    // Chemin relatif pour l'URL (accessible depuis le frontend)
    // Le nom de fichier sera encodé côté frontend si nécessaire
    const cheminFichier = `/document/${docFile.filename}`;
    const typeMime = getMimeType(docFile.filename);
    const taille = getFileSize(filePath);

    documentsToCreate.push({
      patientId: targetPatient.patient.id,
      nom: docFile.nom,
      categorie: docFile.categorie,
      cheminFichier,
      typeMime,
      taille,
      description: docFile.description,
    });
  }

  // Insérer les documents dans la base de données
  if (documentsToCreate.length > 0) {
    for (const doc of documentsToCreate) {
      await db.insert(document).values(doc);
    }
    console.log(`✅ ${documentsToCreate.length} document(s) créé(s) pour le patient ${targetPatient.info.prenom} ${targetPatient.info.nomUsage}`);
  } else {
    console.log("ℹ️  Aucun document à créer");
  }
}
