import type { Patient } from "~/types/patient";

export const patientsData: Patient[] = [
  {
    id: 1,
    dossierNumber: "00000001",
    nom: "Aubry",
    prenom: "Jules",
    dateNaissance: "13/03/2002",
    lieuNaissance: "Le Mans",
    departementNaissance: "Sarthe",
    paysNaissance: "France",
    nomNaissance: "Aubry",
    autresPrenoms: "Max, Anthony",
    sexe: "Homme",
    telephone: "06 12 34 56 78",
    email: "jules.aubry@example.com",
    adresse: "123 Rue de la République",
    codePostal: "72000",
    ville: "Le Mans",
    dernieresModifications: "08/01/2026",
  },
  {
    id: 2,
    dossierNumber: "00000002",
    nom: "Martin",
    prenom: "Sophie",
    dateNaissance: "22/05/1995",
    lieuNaissance: "Paris",
    departementNaissance: "Paris",
    paysNaissance: "France",
    nomNaissance: "Martin",
    autresPrenoms: "",
    sexe: "Femme",
    telephone: "06 98 76 54 32",
    email: "sophie.martin@example.com",
    adresse: "45 Avenue des Champs-Élysées",
    codePostal: "75008",
    ville: "Paris",
    dernieresModifications: "05/01/2026",
  },
  {
    id: 3,
    dossierNumber: "00000003",
    nom: "Dubois",
    prenom: "Pierre",
    dateNaissance: "10/11/1988",
    lieuNaissance: "Lyon",
    departementNaissance: "Rhône",
    paysNaissance: "France",
    nomNaissance: "Dubois",
    autresPrenoms: "Jean",
    sexe: "Homme",
    telephone: "06 11 22 33 44",
    email: "pierre.dubois@example.com",
    adresse: "78 Rue de la République",
    codePostal: "69002",
    ville: "Lyon",
    dernieresModifications: "12/01/2026",
  },
  {
    id: 4,
    dossierNumber: "00000004",
    nom: "Bernard",
    prenom: "Marie",
    dateNaissance: "03/07/1992",
    lieuNaissance: "Marseille",
    departementNaissance: "Bouches-du-Rhône",
    paysNaissance: "France",
    nomNaissance: "Bernard",
    autresPrenoms: "",
    sexe: "Femme",
    telephone: "06 55 66 77 88",
    email: "marie.bernard@example.com",
    adresse: "12 Cours Mirabeau",
    codePostal: "13001",
    ville: "Marseille",
    dernieresModifications: "15/01/2026",
  },
];

export function getPatientById(id: number): Patient | undefined {
  return patientsData.find((patient) => patient.id === id);
}

export function getPatientByDossierNumber(
  dossierNumber: string
): Patient | undefined {
  return patientsData.find(
    (patient) => patient.dossierNumber === dossierNumber
  );
}

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
