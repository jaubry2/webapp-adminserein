export interface Document {
  id: string;
  patientId: string;
  nom: string;
  categorie: "IDENTITE" | "MEDICAL" | "ADMINISTRATIF" | "JURIDIQUE" | "LOGEMENT" | "EMPLOI" | "AUTRE";
  cheminFichier: string;
  typeMime: string;
  taille: string;
  description?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}
