export function calculateAge(dateNaissance: string): number {
  const [day, month, year] = dateNaissance.split("/").map(Number);
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

// Données d'exemple pour l'historique des patients
import type { EvenementHistorique } from "../types/historique";

const historiqueData: Record<number, EvenementHistorique[]> = {
  1: [
    {
      id: 1,
      date: "25/12/2025",
      heure: "12h00",
      titre: "Demande d'aide",
      description: "Demande d'APL",
    },
    {
      id: 2,
      date: "13/03/2025",
      heure: "14h00",
      titre: "Fête d'anniversaire",
      description: "Grosse dépense",
    },
  ],
  2: [],
  3: [],
  4: [],
};

export function getHistoriqueByPatientId(
  patientId: number
): EvenementHistorique[] {
  return historiqueData[patientId] || [];
}
