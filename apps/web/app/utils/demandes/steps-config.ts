import type { DemandeStepsConfig } from "~/types/demandes";

export const stepsByDemandeType: DemandeStepsConfig = {
  APA: [
    {
      id: "collecte_documents",
      label: "Rassembler les documents",
      icon: "i-lucide-folder-open",
      defaultDescription: "Préparer tous les justificatifs nécessaires pour l’APA.",
      defaultTodos: [
        { label: "Justificatif d'identité" },
        { label: "Relevé d'identité bancaire" },
        {
          label: "Photocopie du dernier avis d'imposition ou de non-imposition sur le revenu du demandeur et celui de son conjoint. Certains document sont demandés sous certaines conditions."
        },
        { label: "Certificat médical pour demander l’APA avec ou sans demande de CMI sous pli cacheté" },
        { label: "Si concerné : Photocopie de la décision de justice relative à la mise sous protection" },
        { label: "Si concerné : Photocopie de la décision de refus de l’APA en cas de demande d’APA refusée par le département" },
        { label: "Si concerné : Photocopie du titre ou brevet de pension et d’un relevé d’identité bancaire (RIB) pour les retraités de la Fonction publique d’État" },
        { label: "Si concerné : Photocopie du(des) dernier(s) avis de taxe foncière pour chaque bien du demandeur et de son conjoint qui n’est pas mis en location" },
      ],
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
};

