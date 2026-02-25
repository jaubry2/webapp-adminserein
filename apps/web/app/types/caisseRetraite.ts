export type CaisseRetraite =
  | "ASSURANCE_RETRAITE"
  | "FONCTION_PUBLIQUE_ETAT"
  | "MSA"
  | "AUTRE";

export const CAISSE_RETRAITE_OPTIONS: Record<CaisseRetraite, string> = {
  ASSURANCE_RETRAITE: "Assurance retraite",
  FONCTION_PUBLIQUE_ETAT: "Fonction publique d'État",
  MSA: "MSA",
  AUTRE: "Autre",
};

