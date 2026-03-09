import type { DemandeStepsConfig, EtapeTodoStatus } from "~/types/demandes";

export const stepsByDemandeType: DemandeStepsConfig = {
  APA: [
    {
      id: "collecte_documents",
      label: "Rassembler les documents",
      icon: "i-lucide-folder-open",
      defaultDescription: "Préparer tous les justificatifs nécessaires pour l’APA.",
      defaultTodos: [
        { id: "justificatif_identite", label: "Justificatif d'identité", status: "TODO" as EtapeTodoStatus },
        { id: "releve_identite_bancaire", label: "Relevé d'identité bancaire", status: "TODO" as EtapeTodoStatus },
        {
          id: "avis_imposition", label: "Photocopie du dernier avis d'imposition ou de non-imposition sur le revenu du demandeur et celui de son conjoint. Certains document sont demandés sous certaines conditions.", status: "TODO" as EtapeTodoStatus
        },
        { id: "certificat_medical", label: "Certificat médical pour demander l’APA avec ou sans demande de CMI sous pli cacheté", status: "TODO" as EtapeTodoStatus },
        { id: "decision_justice", label: "Si concerné : Photocopie de la décision de justice relative à la mise sous protection", status: "TODO" as EtapeTodoStatus },
        { id: "decision_justice", label: "Si concerné : Photocopie de la décision de refus de l’APA en cas de demande d’APA refusée par le département", status: "TODO" as EtapeTodoStatus },
        { id: "titre_brevet_pension", label: "Si concerné : Photocopie du titre ou brevet de pension et d’un relevé d’identité bancaire (RIB) pour les retraités de la Fonction publique d’État", status: "TODO" as EtapeTodoStatus },
        { id: "avis_taxe_fonciere", label: "Si concerné : Photocopie du(des) dernier(s) avis de taxe foncière pour chaque bien du demandeur et de son conjoint qui n’est pas mis en location", status: "TODO" as EtapeTodoStatus },
      ],
    },
    {
      id: "remplir_formulaire",
      label: "Remplir le formulaire",
      icon: "i-lucide-file-text",
      defaultDescription: "Compléter le formulaire officiel APA avec les informations du bénéficiaire.",

    },
    {
      id: "visite_medicale",
      label: "Visite médicale / évaluation",
      icon: "i-lucide-stethoscope",
      defaultDescription: "Réaliser une visite médical afin de remplir le certificat médical.",
    },
    {
      id: "envoi_dossier",
      label: "Envoyer le dossier",
      icon: "i-lucide-send",
      dependsOn: ["visite_medicale", "remplir_formulaire", "collecte_documents"],
      defaultDescription: "Vérifier et transmettre le dossier complet aux services du département ou la caisse de retraite.",
    },
  ],
  MDPH: [
    {
      id: "collecte_documents",
      label: "Rassembler les documents",
      icon: "i-lucide-folder-open",
      defaultDescription: "Préparer tous les justificatifs nécessaires pour le dossier MDPH.",
      defaultTodos: [
        { id: "justificatif_identite", label: "Justificatif d'identité", status: "TODO" as EtapeTodoStatus },
        { id: "justificatif_domicile", label: "Justificatif de domicile", status: "TODO" as EtapeTodoStatus },
        { id: "releve_identite_bancaire", label: "Relevé d'identité bancaire", status: "TODO" as EtapeTodoStatus },
        {
          id: "avis_imposition", label: "Photocopie du dernier avis d'imposition ou de non-imposition sur le revenu du demandeur et celui de son conjoint. Certains document sont demandés sous certaines conditions.", status: "TODO" as EtapeTodoStatus
        },
        { id: "certificat_medical", label: "Certificat médical MDPH", status: "TODO" as EtapeTodoStatus },
      ],
    },
    {
      id: "remplir_formulaire",
      label: "Remplir le formulaire MDPH",
      icon: "i-lucide-file-text",
      defaultDescription: "Compléter le formulaire MDPH avec les informations du bénéficiaire.",
    },
    {
      id: "envoi_dossier",
      label: "Envoyer le dossier",
      icon: "i-lucide-send",
      dependsOn: ["remplir_formulaire", "collecte_documents"],
      defaultDescription: "Vérifier et transmettre le dossier complet à la MDPH compétente.",
    },
  ],
  ASH: [
    {
      id: "collecte_documents",
      label: "Rassembler les documents",
      icon: "i-lucide-folder-open",
      defaultDescription: "Préparer tous les justificatifs nécessaires pour l’APA.",
      defaultTodos: [
        { id: "justificatif_identite", label: "Justificatif d'identité", status: "TODO" as EtapeTodoStatus },
        { id: "justificatif_ressources", label: "Justificatif de ressources", status: "TODO" as EtapeTodoStatus },
        {
          id: "devis", label: "Devis des frais", status: "TODO" as EtapeTodoStatus
        },
        { id: "Grille AGGIR", label: "Grille AGGIR", status: "TODO" as EtapeTodoStatus },
      ],
    },
    {
      id: "recuperer_formulaire",
      label: "Recuperer le formulaire",
      icon: "i-lucide-file-text",
      defaultDescription:
        "Recuperer le formulaire officiel ASH auprès du CCAS départemental (annuaire des CCAS : https://www.pour-les-personnes-agees.gouv.fr/annuaire-ccas).",
    },
    {
      id: "remplir_formulaire",
      label: "Remplir le formulaire",
      icon: "i-lucide-file-text",
      defaultDescription: "Compléter le formulaire officiel ASH avec les informations du bénéficiaire.",

    },
  ],
};

