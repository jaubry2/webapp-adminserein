import { typeDemandeEnum } from "@webapp-adminserein/db";

type TypeDemandeValue = (typeof typeDemandeEnum.enumValues)[number];

interface BackendStepDef {
  id: string;
  label: string;
  defaultDescription?: string;
  defaultTodos?: { label: string }[];
}

export const backendStepsByDemandeType: Record<TypeDemandeValue, BackendStepDef[]> =
{
  APA: [
    {
      id: "collecte_documents",
      label: "Rassembler les documents",
      defaultDescription: "Préparer tous les justificatifs nécessaires pour l’APA.",
      defaultTodos: [
        { label: "Justificatif d'identité" },
        { label: "Relevé d'identité bancaire" },
        {
          label:
            "Photocopie du dernier avis d'imposition ou de non-imposition sur le revenu du demandeur et celui de son conjoint. Certains document sont demandés sous certaines conditions.",
        },
        {
          label:
            "Certificat médical pour demander l’APA avec ou sans demande de CMI sous pli cacheté",
        },
        { label: "Si concerné : Photocopie de la décision de justice relative à la mise sous protection" },
        { label: "Si concerné : Photocopie de la décision de refus de l’APA en cas de demande d’APA refusée par le département" },
        { label: "Si concerné : Photocopie du titre ou brevet de pension et d’un relevé d’identité bancaire (RIB) pour les retraités de la Fonction publique d’État" },
        { label: "Si concerné : Photocopie du(des) dernier(s) avis de taxe foncière pour chaque bien du demandeur et de son conjoint qui n’est pas mis en location" },

      ],
    },
    {
      id: "remplir_formulaire",
      label: "Remplir le formulaire",
      defaultDescription:
        "Compléter le formulaire officiel APA avec les informations du bénéficiaire.",
    },
    {
      id: "visite_medicale",
      label: "Visite médicale / évaluation",
      defaultDescription:
        "Réaliser une visite médical afin de remplir le certificat médical.",
    },
    {
      id: "envoi_dossier",
      label: "Envoyer le dossier",
      defaultDescription:
        "Vérifier et transmettre le dossier complet aux services du département ou la caisse de retraite.",
    },
  ],
  MDPH: [
    {
      id: "collecte_documents",
      label: "Rassembler les documents",
      defaultDescription: "Préparer tous les justificatifs nécessaires pour le dossier MDPH.",
    },
    {
      id: "remplir_formulaire",
      label: "Remplir le formulaire MDPH",
      defaultDescription:
        "Compléter le formulaire MDPH avec les informations du bénéficiaire.",
    },
    {
      id: "envoi_dossier",
      label: "Envoyer le dossier",
      defaultDescription:
        "Vérifier et transmettre le dossier complet à la MDPH compétente.",
    },
  ],
  CAF_AIDE_LOGEMENT: [
    {
      id: "collecte_documents",
      label: "Rassembler les documents",
    },
    {
      id: "remplir_formulaire",
      label: "Remplir le formulaire",
    },
    {
      id: "envoi_dossier",
      label: "Envoyer la demande",
    },
  ],
  RSA: [
    {
      id: "collecte_documents",
      label: "Rassembler les documents",
    },
    {
      id: "remplir_formulaire",
      label: "Remplir le formulaire",
    },
    {
      id: "envoi_dossier",
      label: "Envoyer la demande",
    },
  ],
  AAH: [
    {
      id: "collecte_documents",
      label: "Rassembler les documents",
    },
    {
      id: "remplir_formulaire",
      label: "Remplir le formulaire",
    },
    {
      id: "visite_medicale",
      label: "Évaluation médicale",
    },
    {
      id: "envoi_dossier",
      label: "Envoyer le dossier",
    },
  ],
  ASH: [
    {
      id: "orientation_ccas",
      label: "Identifier le bon CCAS / département",
      defaultDescription:
        "Repérer le CCAS ou le service départemental compétent en fonction de la commune et du code postal.",
    },
    {
      id: "rdv_ccas",
      label: "Contacter le CCAS / département",
      defaultDescription:
        "Prendre contact avec le CCAS ou le département pour connaître la procédure et récupérer le dossier de demande d’ASH.",
    },
    {
      id: "envoi_dossier",
      label: "Déposer ou envoyer le dossier",
      defaultDescription:
        "Compléter le dossier papier avec les justificatifs demandés puis le déposer ou l’envoyer au service compétent.",
    },
  ],
};

