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

export interface PersonneProche {
  id: string;
  genre: "MASCULIN" | "FEMININ" | "AUTRE";
  nomUsage: string;
  nomNaissance: string;
  prenom: string;
  autresPrenoms?: string;
  adresse: string;
  codePostal: string;
  ville: string;
  telephone: string;
  mail: string;
  lien: string;
  ordre: number;
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
  personnesProches?: PersonneProche[];
  dernieresModifications: string;
}

