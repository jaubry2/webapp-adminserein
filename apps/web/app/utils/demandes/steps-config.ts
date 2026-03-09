import type { DemandeStepsConfig } from "~/types/demandes";

export const stepsByDemandeType: DemandeStepsConfig = {
  APA: [
    {
      id: "collecte_documents",
      label: "Rassembler les documents",
      icon: "i-lucide-folder-open",
    },
    {
      id: "remplir_formulaire",
      label: "Remplir le formulaire",
      icon: "i-lucide-file-text",
      dependsOn: ["collecte_documents"],
    },
    {
      id: "visite_medicale",
      label: "Visite médicale / évaluation",
      icon: "i-lucide-stethoscope",
      dependsOn: ["remplir_formulaire"],
    },
    {
      id: "envoi_dossier",
      label: "Envoyer le dossier",
      icon: "i-lucide-send",
      dependsOn: ["visite_medicale"],
    },
  ],
  CAF_AIDE_LOGEMENT: [
    {
      id: "collecte_documents",
      label: "Rassembler les documents",
      icon: "i-lucide-folder-open",
    },
    {
      id: "remplir_formulaire",
      label: "Remplir le formulaire",
      icon: "i-lucide-file-text",
      dependsOn: ["collecte_documents"],
    },
    {
      id: "envoi_dossier",
      label: "Envoyer la demande",
      icon: "i-lucide-send",
      dependsOn: ["remplir_formulaire"],
    },
  ],
  RSA: [
    {
      id: "collecte_documents",
      label: "Rassembler les documents",
      icon: "i-lucide-folder-open",
    },
    {
      id: "remplir_formulaire",
      label: "Remplir le formulaire",
      icon: "i-lucide-file-text",
      dependsOn: ["collecte_documents"],
    },
    {
      id: "envoi_dossier",
      label: "Envoyer la demande",
      icon: "i-lucide-send",
      dependsOn: ["remplir_formulaire"],
    },
  ],
  AAH: [
    {
      id: "collecte_documents",
      label: "Rassembler les documents",
      icon: "i-lucide-folder-open",
    },
    {
      id: "remplir_formulaire",
      label: "Remplir le formulaire",
      icon: "i-lucide-file-text",
      dependsOn: ["collecte_documents"],
    },
    {
      id: "visite_medicale",
      label: "Évaluation médicale",
      icon: "i-lucide-stethoscope",
      dependsOn: ["remplir_formulaire"],
    },
    {
      id: "envoi_dossier",
      label: "Envoyer le dossier",
      icon: "i-lucide-send",
      dependsOn: ["visite_medicale"],
    },
  ],
};

