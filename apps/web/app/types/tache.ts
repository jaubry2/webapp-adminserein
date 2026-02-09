export interface Tache {
  id: string;
  patientId: string;
  professionnelId: string;
  typeDemarche: "ADMINISTRATIVE" | "MEDICALE" | "SOCIALE" | "JURIDIQUE" | "LOGEMENT" | "EMPLOI" | "AUTRE";
  etat: "A_FAIRE" | "EN_COURS" | "TERMINEE" | "ANNULEE";
  date: Date | string;
  details: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  // Relations optionnelles
  patient?: {
    id: string;
    numeroDossier: string;
    informationIdentite?: {
      nomUsage: string;
      prenom: string;
    };
  };
  professionnel?: {
    id: string;
    nom: string;
    prenom: string;
    fonction: string;
  };
}
