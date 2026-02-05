export interface Patient {
  id: string;
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
  informationComplementaires?: string;
  codePostal?: string;
  ville?: string;
  departement?: string;
  pays?: string;
  dernieresModifications: string;
}

