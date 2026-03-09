export interface DemandeDefinition {
  id: string;
  titre: string;
  description: string;
  dureeMinutes: number;
  organisme: string;
}

export const demandesData: DemandeDefinition[] = [
  {
    id: "apa",
    titre: "Allocation Personnalisée d’Autonomie (APA)",
    description: "Aide financière pour les personnes âgées en perte d’autonomie.",
    dureeMinutes: 10,
    organisme: "Département / Caisse de retraite",
  },
  {
    id: "mdph",
    titre: "Dossier MDPH",
    description: "Constitution et suivi d’un dossier auprès de la MDPH.",
    dureeMinutes: 15,
    organisme: "MDPH",
  },
  {
    id: "ash",
    titre: "Aide sociale à l’hébergement",
    description: "Constitution et suivi d’un dossier auprès de l'Aide sociale à l’hébergement.",
    dureeMinutes: 15,
    organisme: "Département",
  },
  /*
  {
    id: "caf-aide-logement",
    titre: "Aide au logement (CAF)",
    description: "Aide pour le paiement du loyer ou du prêt immobilier.",
    dureeMinutes: 8,
    organisme: "CAF",
  },
  {
    id: "rsa",
    titre: "Revenu de Solidarité Active (RSA)",
    description: "Aide pour les personnes sans ressources ou à faibles revenus.",
    dureeMinutes: 12,
    organisme: "CAF / Département",
  },
  {
    id: "aah",
    titre: "Allocation Adulte Handicapé (AAH)",
    description: "Aide financière pour les personnes en situation de handicap.",
    dureeMinutes: 15,
    organisme: "CAF / MDPH",
  },
  */
];

export function getAllDemandes(): DemandeDefinition[] {
  return demandesData;
}

