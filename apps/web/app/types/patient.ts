export interface Patient {
  id: number;
  dossierNumber: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance?: string;
  departementNaissance?: string;
  paysNaissance?: string;
  nomNaissance?: string;
  autresPrenoms?: string;
  sexe?: "Homme" | "Femme" | "Autre";
  telephone?: string;
  email?: string;
  adresse?: string;
  codePostal?: string;
  ville?: string;
  dernieresModifications: string;
}

