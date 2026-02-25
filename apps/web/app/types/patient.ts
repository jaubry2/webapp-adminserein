import type { CaisseRetraite } from "./caisseRetraite";

export interface Conjoint {
  nom: string;
  prenom: string;
  nomNaissance?: string;
  autresPrenoms?: string;
  sexe?: "Homme" | "Femme" | "Autre";
  dateNaissance?: string;
  lieuNaissance?: string;
  departementNaissance?: string;
  paysNaissance?: string;
  nationalites?: string;
  numeroSecuriteSociale?: string;
}

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
  numeroSecuriteSociale?: string;
  nationalites?: string;
  situationFamiliale?: string;
  caisseRetraite?: CaisseRetraite | string;
  conjoint?: Conjoint;
  dernieresModifications: string;
}

