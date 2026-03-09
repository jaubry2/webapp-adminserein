import { typeDemandeEnum } from "@webapp-adminserein/db";

type TypeDemandeValue = (typeof typeDemandeEnum.enumValues)[number];

interface BackendStepDef {
  id: string;
  label: string;
}

export const backendStepsByDemandeType: Record<TypeDemandeValue, BackendStepDef[]> =
  {
    APA: [
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
        label: "Visite médicale / évaluation",
      },
      {
        id: "envoi_dossier",
        label: "Envoyer le dossier",
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
  };

