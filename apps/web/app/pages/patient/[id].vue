<script setup lang="ts">
import type { Patient, PersonneProche } from "~/types/patient";
import type { Tache } from "~/types/tache";
import type { Document } from "~/types/document";
import {
  useQuery,
  useMutation,
  useQueryClient,
  skipToken,
} from "@tanstack/vue-query";
import type { Change } from "~/components/OngletInformation/ModificationSummary.vue";
import { PDFDocument } from "pdf-lib";
import { getListFieldForm, getValue } from "~/composables/useInfoFormulaire";
import NouvelleDemandeModal from "~/components/NouvelleDemandeModal.vue";

definePageMeta({
  middleware: ["auth"],
});

const route = useRoute();
const { $authClient, $orpc } = useNuxtApp();
const queryClient = useQueryClient();
const toast = useToast();
const { calculateAge, getHistoriqueByPatientId } =
  await import("~/utils/patients");

const patientId = computed(() => String(route.params.id));
const showNouvelleDemandeModal = ref(false);

// Vérifier la session avant de faire les requêtes
const session = $authClient.useSession();

// Récupération du patient depuis l'API
// Ne faire la requête que si la session est chargée et valide
const {
  data: apiPatient,
  isLoading,
  isError,
  error,
} = useQuery({
  ...$orpc.getPatientById.queryOptions({
    input: {
      patientId: patientId.value,
    },
  }),
  enabled: computed(() => {
    return (
      !!session.value?.data && !session.value.isPending && !!patientId.value
    );
  }),
});

// Mapping API -> type Patient utilisé par l'UI
const patient = computed<Patient | null>(() => {
  if (!apiPatient.value) return null;

  const p = apiPatient.value as any;
  const info = p.informationIdentite;
  const coord = p.informationCoordonnee;
  const conjointInfo = p.informationConjoint as
    | {
        nomUsage?: string;
        nomNaissance?: string;
        prenom?: string;
        autresPrenoms?: string[] | null;
        genre?: "MASCULIN" | "FEMININ" | "AUTRE";
        dateNaissance?: string | Date | null;
        villeNaissance?: string;
        departementNaissance?: string;
        paysNaissance?: string;
        nationalites?: string[] | null;
        numeroSecuriteSociale?: string;
      }
    | null
    | undefined;

  const dateNaissance =
    info?.dateNaissance instanceof Date
      ? info.dateNaissance.toLocaleDateString("fr-FR")
      : typeof info?.dateNaissance === "string"
        ? new Date(info.dateNaissance).toLocaleDateString("fr-FR")
        : "";

  let conjoint: Patient["conjoint"] = undefined;
  if (conjointInfo) {
    const conjointDateNaissance =
      conjointInfo.dateNaissance instanceof Date
        ? conjointInfo.dateNaissance.toLocaleDateString("fr-FR")
        : typeof conjointInfo.dateNaissance === "string"
          ? new Date(conjointInfo.dateNaissance).toLocaleDateString("fr-FR")
          : "";

    conjoint = {
      nom: conjointInfo.nomUsage ?? "",
      prenom: conjointInfo.prenom ?? "",
      nomNaissance: conjointInfo.nomNaissance ?? undefined,
      autresPrenoms: conjointInfo.autresPrenoms?.join(", ") ?? undefined,
      sexe:
        conjointInfo.genre === "MASCULIN"
          ? "Homme"
          : conjointInfo.genre === "FEMININ"
            ? "Femme"
            : conjointInfo.genre
              ? "Autre"
              : undefined,
      dateNaissance: conjointDateNaissance || undefined,
      lieuNaissance: conjointInfo.villeNaissance ?? undefined,
      departementNaissance: conjointInfo.departementNaissance ?? undefined,
      paysNaissance: conjointInfo.paysNaissance ?? undefined,
      nationalites: conjointInfo.nationalites?.join(", ") ?? undefined,
      numeroSecuriteSociale: conjointInfo.numeroSecuriteSociale ?? undefined,
    };
  }

  return {
    id: p.id,
    dossierNumber: p.numeroDossier,
    nom: info?.nomUsage ?? "",
    prenom: info?.prenom ?? "",
    dateNaissance,
    lieuNaissance: info?.villeNaissance,
    departementNaissance: info?.departementNaissance,
    paysNaissance: info?.paysNaissance,
    nomNaissance: info?.nomNaissance,
    autresPrenoms: info?.autresPrenoms?.join(", "),
    sexe:
      info?.genre === "MASCULIN"
        ? "Homme"
        : info?.genre === "FEMININ"
          ? "Femme"
          : info?.genre
            ? "Autre"
            : undefined,
    telephone: coord?.numeroTelephone ?? undefined,
    email: coord?.adresseMail ?? undefined,
    adresse: coord?.adresse ?? undefined,
    informationComplementaires: coord?.informationComplementaires ?? undefined,
    codePostal: coord?.codePostal ?? undefined,
    ville: coord?.ville ?? undefined,
    departement: coord?.departement ?? undefined,
    pays: coord?.pays ?? undefined,
    numeroSecuriteSociale: info?.numeroSecuriteSociale ?? undefined,
    nationalites: info?.nationalites?.join(", ") ?? undefined,
    situationFamiliale:
      info?.situationFamiliale === "CELIBATAIRE"
        ? "Célibataire"
        : info?.situationFamiliale === "MARIE"
          ? "Marié(e)"
          : info?.situationFamiliale === "DIVORCE"
            ? "Divorcé(e)"
            : info?.situationFamiliale === "VEUF"
              ? "Veuf(ve)"
              : info?.situationFamiliale === "PACSE"
                ? "Pacsé(e)"
                : info?.situationFamiliale === "CONCUBINAGE"
                  ? "Concubinage"
                  : undefined,
    caisseRetraite: info?.caisseRetraite ?? undefined,
    conjoint,
    dernieresModifications: "",
  };
});

const age = computed(() => {
  if (patient.value?.dateNaissance) {
    return calculateAge(patient.value.dateNaissance);
  }
  return null;
});

const activeTab = ref("information");
const identiteExpanded = ref(true);
const coordonneesExpanded = ref(true);

// Récupération de l'historique du patient (mock pour le moment)
const historique = computed(() =>
  getHistoriqueByPatientId(Number(patientId.value)),
);

// Récupération des tâches du patient
// Ne faire la requête que si la session est chargée et valide
const {
  data: patientTaches,
  isLoading: isLoadingTaches,
  isError: isErrorTaches,
} = useQuery({
  ...$orpc.listTachesByPatient.queryOptions({
    input: {
      patientId: patientId.value,
    },
  }),
  enabled: computed(() => {
    return (
      !!session.value?.data && !session.value.isPending && !!patientId.value
    );
  }),
});

const requestedDocuments = computed(() => {
  if (!patientTaches.value) return [];
  return (patientTaches.value as Tache[])
    .filter(
      (t) =>
        t.typeDemarche === "ADMINISTRATIVE" &&
        t.etat !== "TERMINEE" &&
        t.details.startsWith('Demande de document à téléverser : "'),
    )
    .map((t) => {
      // extraire nomDocument et categorie du détail
      // format: Demande de document à téléverser : "Nom" (catégorie CATEGORIE) ...
      const match = t.details.match(
        /^Demande de document à téléverser : "(.+?)" \(catégorie ([A-Z_]+)\)/,
      );
      const nom = match?.[1] ?? t.details;
      const categorie = match?.[2] ?? "AUTRE";
      return {
        id: t.id,
        nom,
        categorie,
      };
    });
});

// Récupération des documents du patient
// Ne faire la requête que si la session est chargée et valide
const {
  data: patientDocuments,
  isLoading: isLoadingDocuments,
  isError: isErrorDocuments,
} = useQuery({
  ...$orpc.listDocumentsByPatient.queryOptions({
    input: {
      patientId: patientId.value,
    },
  }),
  enabled: computed(() => {
    return (
      !!session.value?.data && !session.value.isPending && !!patientId.value
    );
  }),
});

// Récupération des personnes proches du patient
// Ne faire la requête que si la session est chargée et valide
const {
  data: personnesProchesData,
  isLoading: isLoadingPersonnesProches,
  isError: isErrorPersonnesProches,
} = useQuery({
  ...$orpc.listPersonnesProchesByPatient.queryOptions({
    input: {
      patientId: patientId.value,
    },
  }),
  enabled: computed(() => {
    return (
      !!session.value?.data && !session.value.isPending && !!patientId.value
    );
  }),
});

const personnesProches = computed<PersonneProche[]>(() => {
  if (!personnesProchesData.value) return [];

  return (personnesProchesData.value as any[]).map((p) => ({
    id: p.id,
    genre: p.genre,
    nomUsage: p.nomUsage,
    nomNaissance: p.nomNaissance,
    prenom: p.prenom,
    autresPrenoms: Array.isArray(p.autresPrenoms)
      ? p.autresPrenoms.join(", ")
      : (p.autresPrenoms ?? ""),
    adresse: p.adresse,
    codePostal: p.codePostal,
    ville: p.ville,
    telephone: p.telephone,
    mail: p.mail,
    lien: p.lien,
    ordre: typeof p.ordre === "number" ? p.ordre : 0,
  }));
});

// Demandes liées au patient
const {
  data: patientDemandes,
  isLoading: isLoadingDemandes,
  isError: isErrorDemandes,
} = useQuery(
  computed(() => ({
    ...$orpc.listDemandesByPatient.queryOptions({
      input: patientId.value ? { patientId: patientId.value } : skipToken,
    }),
    enabled:
      !!session.value?.data && !session.value.isPending && !!patientId.value,
  })),
);

const typeDemandeLabels: Record<string, string> = {
  APA: "APA",
  CAF_AIDE_LOGEMENT: "Aide au logement (CAF)",
  RSA: "RSA",
  AAH: "AAH",
  ASH: "ASH",
};

const statutDemandeLabels: Record<string, string> = {
  BROUILLON: "Brouillon",
  EN_COURS: "En cours",
  EN_ATTENTE_COMPLEMENT: "En attente de réponse / validation",
  TERMINEE: "Terminée",
  ANNULEE: "Annulée",
};

const statutDemandeColors: Record<string, string> = {
  BROUILLON: "bg-gray-100 text-gray-700",
  EN_COURS: "bg-blue-100 text-blue-700",
  EN_ATTENTE_COMPLEMENT: "bg-orange-100 text-orange-700",
  TERMINEE: "bg-green-100 text-green-700",
  ANNULEE: "bg-red-100 text-red-700",
};

const updateStatutMutation = useMutation({
  ...$orpc.updateDemandeStatut.mutationOptions(),
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ["listDemandesByPatient"],
    });
    toast.add({
      title: "Demande mise à jour",
      description: "Le statut a été mis à jour en temps réel.",
    });
  },
  onError: (error: any) => {
    toast.add({
      title: "Erreur",
      description: error?.message || "Impossible de mettre à jour le statut.",
      color: "error",
    });
  },
});

const changeStatut = async (demandeId: string, statut: string) => {
  await updateStatutMutation.mutateAsync({
    demandeId,
    statut: statut as
      | "BROUILLON"
      | "EN_COURS"
      | "EN_ATTENTE_COMPLEMENT"
      | "TERMINEE"
      | "ANNULEE",
  });
};

const updateDetailsDemandeMutation = useMutation({
  ...$orpc.updateDemandeDetails.mutationOptions(),
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ["listDemandesByPatient"],
    });
    toast.add({
      title: "Commentaire mis à jour",
      description: "Le commentaire de la demande a été enregistré.",
    });
  },
  onError: (error: any) => {
    toast.add({
      title: "Erreur",
      description:
        error?.message || "Impossible de mettre à jour le commentaire.",
      color: "error",
    });
  },
});

const handleUpdateCommentPatient = async (payload: {
  id: string;
  details: string;
}) => {
  await updateDetailsDemandeMutation.mutateAsync({
    demandeId: payload.id,
    details: payload.details,
  });
};

const getDemandeCreateur = (d: any): string => {
  if (d.professionnelInfo) {
    return `${d.professionnelInfo.prenom} ${d.professionnelInfo.nom}`;
  }
  return "Particulier";
};

const formatDemandeDate = (dateStr: string | Date): string => {
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const APA_OFFICIAL_PDF_PATH = "/pdf/apa_remplissable.pdf";

const generateApaPdfFromDemande = async (
  donneesFormulaire: any,
  options: { download: boolean },
) => {
  if (!process.client) return;

  const existingPdfBytes = await fetch(APA_OFFICIAL_PDF_PATH).then((res) =>
    res.arrayBuffer(),
  );
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const form = pdfDoc.getForm();
  const field_names = form.getFields().map((field: any) => field.getName());

  Object.keys(donneesFormulaire ?? {}).forEach((key) => {
    const value = getValue(donneesFormulaire, key);
    const fields_list = getListFieldForm(donneesFormulaire, key);
    if (!value) {
      return;
    } else if (fields_list.length === 1) {
      if (field_names.includes(fields_list[0])) {
        form.getTextField(fields_list[0]).setText(value);
      }
    } else if (fields_list[0].startsWith("est")) {
      if (field_names.includes(value)) {
        form.getCheckBox(value).check();
      }
    } else {
      let charList = value.split("");
      if (charList.includes("-")) {
        const wait = [
          charList[8],
          charList[9],
          charList[5],
          charList[6],
          charList[0],
          charList[1],
          charList[2],
          charList[3],
        ];
        charList = wait;
      }
      for (let i = 0; i < fields_list.length; i++) {
        if (field_names.includes(fields_list[i])) {
          form.getTextField(fields_list[i]).setText(charList[i] || "");
        }
      }
    }
  });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });

  if (options.download) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "demande_APA_remplie.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } else {
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
};

// Formater les tâches pour l'affichage
type TaskAccentColor =
  | "peach"
  | "lavender"
  | "emerald"
  | "sky"
  | "amber"
  | "violet"
  | "teal"
  | "indigo"
  | "slate";

const formattedPatientTaches = computed(() => {
  if (!patientTaches.value) return [];

  return patientTaches.value.map((tache: Tache) => {
    const date =
      tache.date instanceof Date
        ? tache.date.toLocaleDateString("fr-FR")
        : typeof tache.date === "string"
          ? new Date(tache.date).toLocaleDateString("fr-FR")
          : "";

    const accentColor = getAccentColorByType(tache.typeDemarche);

    const statusLabel =
      tache.etat === "TERMINEE"
        ? "Terminée"
        : tache.etat === "EN_COURS"
          ? "En cours"
          : tache.etat === "ANNULEE"
            ? "Annulée"
            : tache.etat === "A_FAIRE"
              ? "À faire"
              : undefined;

    const label =
      tache.typeDemarche === "DOSSIER"
        ? getDossierTaskLabel(tache.details)
        : `Démarche - ${getTypeDemarcheLabel(tache.typeDemarche)}`;

    return {
      id: tache.id,
      label,
      patientName: `${patient.value?.nom} ${patient.value?.prenom}`,
      date,
      accentColor,
      statusLabel,
      tache,
    };
  });
});

// Fonction pour obtenir la couleur d'accent selon le type de démarche
const getAccentColorByType = (type: Tache["typeDemarche"]): TaskAccentColor => {
  switch (type) {
    case "ADMINISTRATIVE":
      return "amber";
    case "MEDICALE":
      return "emerald";
    case "SOCIALE":
      return "sky";
    case "JURIDIQUE":
      return "violet";
    case "LOGEMENT":
      return "teal";
    case "EMPLOI":
      return "indigo";
    case "DOSSIER":
      return "sky";
    case "AUTRE":
    default:
      return "slate";
  }
};

// Fonction pour obtenir le label du type de démarche
const getTypeDemarcheLabel = (type: Tache["typeDemarche"]): string => {
  const labels: Record<Tache["typeDemarche"], string> = {
    ADMINISTRATIVE: "Administrative",
    MEDICALE: "Médicale",
    SOCIALE: "Sociale",
    JURIDIQUE: "Juridique",
    LOGEMENT: "Logement",
    EMPLOI: "Emploi",
    DOSSIER: "Dossier",
    AUTRE: "Autre",
  };
  return labels[type] || type;
};

const getDossierTaskLabel = (details: string): string => {
  if (details.includes("Demande d'accès au dossier")) {
    return "Dossier - Accès";
  }
  if (details.startsWith('Demande de document à téléverser : "')) {
    return "Dossier - Document";
  }
  if (details.includes("vos informations d'identité")) {
    return "Dossier - Identité";
  }
  if (details.includes("vos coordonnées")) {
    return "Dossier - Coordonnées";
  }
  if (details.includes("les informations concernant votre conjoint")) {
    return "Dossier - Conjoint";
  }
  if (details.includes('la section "Personnes proches"')) {
    return "Dossier - Personnes proches";
  }
  return "Dossier";
};

const tabs = [
  { id: "information", label: "Information", icon: "i-lucide-info" },
  { id: "document", label: "Document", icon: "i-lucide-file-text" },
  { id: "historique", label: "Historique", icon: "i-lucide-clock" },
  { id: "tache", label: "Tâche", icon: "i-lucide-check-square" },
  { id: "demande", label: "Demande", icon: "i-lucide-folder-open" },
];

// État d'édition
const isEditingIdentite = ref(false);
const isEditingCoordonnee = ref(false);
const pendingChanges = ref<{
  identite?: Record<string, any>;
  coordonnee?: Record<string, any>;
  conjoint?: Record<string, any>;
}>({});

// Modal de résumé
const showSummaryModal = ref(false);
const summaryChanges = ref<Change[]>([]);

// Mutation pour mettre à jour le patient
const updatePatientMutationOptions = $orpc.updatePatient.mutationOptions();
const updatePatientMutation = useMutation({
  ...updatePatientMutationOptions,
  onSuccess: () => {
    // Rafraîchir les données du patient
    queryClient.invalidateQueries({
      queryKey: $orpc.getPatientById.queryKey({
        input: { patientId: patientId.value },
      }),
    });
    toast.add({
      title: "Modifications enregistrées",
      description: "Les informations du patient ont été mises à jour.",
    });
    // Réinitialiser l'état
    isEditingIdentite.value = false;
    isEditingCoordonnee.value = false;
    pendingChanges.value = {};
    showSummaryModal.value = false;
  },
  onError: (error: any) => {
    toast.add({
      title: "Erreur lors de la mise à jour",
      description: error?.message || "Une erreur est survenue.",
      color: "error",
    });
  },
});

const createPersonneProcheMutation = useMutation({
  ...$orpc.createPersonneProche.mutationOptions(),
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: $orpc.listPersonnesProchesByPatient.queryKey({
        input: { patientId: patientId.value },
      }),
    });
    toast.add({
      title: "Personne proche ajoutée",
      description: "La personne proche a été ajoutée avec succès.",
    });
  },
  onError: (error: any) => {
    toast.add({
      title: "Erreur lors de l'ajout",
      description: error?.message || "Une erreur est survenue.",
      color: "error",
    });
  },
});

const updatePersonneProcheMutation = useMutation({
  ...$orpc.updatePersonneProche.mutationOptions(),
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: $orpc.listPersonnesProchesByPatient.queryKey({
        input: { patientId: patientId.value },
      }),
    });
    toast.add({
      title: "Personne proche mise à jour",
      description: "Les informations ont été mises à jour.",
    });
  },
  onError: (error: any) => {
    toast.add({
      title: "Erreur lors de la mise à jour",
      description: error?.message || "Une erreur est survenue.",
      color: "error",
    });
  },
});

const reorderPersonnesProchesMutation = useMutation({
  ...$orpc.reorderPersonnesProches.mutationOptions(),
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: $orpc.listPersonnesProchesByPatient.queryKey({
        input: { patientId: patientId.value },
      }),
    });
  },
  onError: (error: any) => {
    toast.add({
      title: "Erreur lors du réordonnancement",
      description: error?.message || "Une erreur est survenue.",
      color: "error",
    });
  },
});

// Fonction pour générer le résumé des modifications
const generateSummary = (
  identiteChanges?: Record<string, any>,
  coordonneeChanges?: Record<string, any>,
): Change[] => {
  const changes: Change[] = [];
  const fieldLabels: Record<string, string> = {
    // Identité
    nomUsage: "Nom d'usage",
    nomNaissance: "Nom de naissance",
    prenom: "Prénom",
    autresPrenoms: "Autres prénoms",
    genre: "Genre",
    dateNaissance: "Date de naissance",
    villeNaissance: "Ville de naissance",
    departementNaissance: "Département de naissance",
    paysNaissance: "Pays de naissance",
    nationalites: "Nationalités",
    numeroSecuriteSociale: "Numéro de sécurité sociale",
    situationFamiliale: "Situation familiale",
    // Coordonnées
    adresse: "Adresse",
    informationComplementaires: "Informations complémentaires",
    codePostal: "Code postal",
    ville: "Ville",
    departement: "Département",
    pays: "Pays",
    numeroTelephone: "Numéro de téléphone",
    adresseMail: "Adresse mail",
  };

  if (identiteChanges && patient.value) {
    Object.keys(identiteChanges).forEach((key) => {
      const label = fieldLabels[key] || key;
      let oldValue = "";
      let newValue = String(identiteChanges[key] || "");

      // Récupérer l'ancienne valeur
      switch (key) {
        case "nomUsage":
          oldValue = patient.value?.nom || "";
          break;
        case "nomNaissance":
          oldValue = patient.value?.nomNaissance || "";
          break;
        case "prenom":
          oldValue = patient.value?.prenom || "";
          break;
        case "autresPrenoms":
          oldValue = patient.value?.autresPrenoms || "";
          break;
        case "genre":
          oldValue = patient.value?.sexe || "";
          newValue =
            identiteChanges[key] === "MASCULIN"
              ? "Masculin"
              : identiteChanges[key] === "FEMININ"
                ? "Féminin"
                : "Autre";
          break;
        case "dateNaissance":
          oldValue = patient.value?.dateNaissance || "";
          break;
        case "villeNaissance":
          oldValue = patient.value?.lieuNaissance || "";
          break;
        case "departementNaissance":
          oldValue = patient.value?.departementNaissance || "";
          break;
        case "paysNaissance":
          oldValue = patient.value?.paysNaissance || "";
          break;
        case "nationalites":
          oldValue = patient.value?.nationalites || "";
          break;
        case "numeroSecuriteSociale":
          oldValue = patient.value?.numeroSecuriteSociale || "";
          break;
        case "situationFamiliale":
          oldValue = patient.value?.situationFamiliale || "";
          break;
      }

      changes.push({
        field: key,
        label,
        oldValue: oldValue || "Non renseigné",
        newValue: newValue || "Non renseigné",
      });
    });
  }

  if (coordonneeChanges && patient.value) {
    Object.keys(coordonneeChanges).forEach((key) => {
      const label = fieldLabels[key] || key;
      let oldValue = "";
      let newValue = String(coordonneeChanges[key] || "");

      switch (key) {
        case "adresse":
          oldValue = patient.value?.adresse || "";
          break;
        case "informationComplementaires":
          oldValue = patient.value?.informationComplementaires || "";
          break;
        case "codePostal":
          oldValue = patient.value?.codePostal || "";
          break;
        case "ville":
          oldValue = patient.value?.ville || "";
          break;
        case "departement":
          oldValue = patient.value?.departement || "";
          break;
        case "pays":
          oldValue = patient.value?.pays || "";
          break;
        case "numeroTelephone":
          oldValue = patient.value?.telephone || "";
          break;
        case "adresseMail":
          oldValue = patient.value?.email || "";
          break;
      }

      changes.push({
        field: key,
        label,
        oldValue: oldValue || "Non renseigné",
        newValue: newValue || "Non renseigné",
      });
    });
  }

  return changes;
};

const normalizeAutresPrenoms = (value?: string[] | string): string[] => {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return value
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }
  return [];
};

// Gérer les changements d'identité
const handleIdentiteChanges = (changes: Record<string, any>) => {
  pendingChanges.value.identite = changes;
  // Générer le résumé avec tous les changements (identité + coordonnées si présents)
  summaryChanges.value = generateSummary(
    pendingChanges.value.identite,
    pendingChanges.value.coordonnee,
  );
  // Afficher le modal seulement s'il y a des changements
  if (summaryChanges.value.length > 0) {
    showSummaryModal.value = true;
  }
};

// Gérer les changements de coordonnées
const handleCoordonneeChanges = (changes: Record<string, any>) => {
  pendingChanges.value.coordonnee = changes;
  // Générer le résumé avec tous les changements (identité + coordonnées si présents)
  summaryChanges.value = generateSummary(
    pendingChanges.value.identite,
    pendingChanges.value.coordonnee,
  );
  // Afficher le modal seulement s'il y a des changements
  if (summaryChanges.value.length > 0) {
    showSummaryModal.value = true;
  }
};

// Gérer les changements de conjoint (mise à jour directe sans résumé)
const handleConjointChanges = async (changes: Record<string, any>) => {
  if (!patient.value) return;

  const conjointData: any = { ...changes };

  // Normaliser les champs liste
  if (
    conjointData.autresPrenoms &&
    typeof conjointData.autresPrenoms === "string"
  ) {
    conjointData.autresPrenoms = conjointData.autresPrenoms
      .split(",")
      .map((p: string) => p.trim())
      .filter((p: string) => p.length > 0);
  }
  if (
    conjointData.nationalites &&
    typeof conjointData.nationalites === "string"
  ) {
    conjointData.nationalites = conjointData.nationalites
      .split(",")
      .map((n: string) => n.trim())
      .filter((n: string) => n.length > 0);
  }

  await updatePatientMutation.mutateAsync({
    patientId: patient.value.id,
    informationConjoint: conjointData,
  });
};

const handleCreatePersonneProche = async (payload: {
  genre: PersonneProche["genre"];
  nomUsage: string;
  nomNaissance: string;
  prenom: string;
  autresPrenoms?: string[] | string;
  adresse: string;
  codePostal: string;
  ville: string;
  telephone: string;
  mail: string;
  lien: string;
}) => {
  if (!patient.value) return;

  await createPersonneProcheMutation.mutateAsync({
    patientId: patient.value.id,
    personne: {
      ...payload,
      autresPrenoms: normalizeAutresPrenoms(payload.autresPrenoms),
    },
  });
};

const handleUpdatePersonneProche = async (payload: {
  id: string;
  genre?: PersonneProche["genre"];
  nomUsage?: string;
  nomNaissance?: string;
  prenom?: string;
  autresPrenoms?: string[] | string;
  adresse?: string;
  codePostal?: string;
  ville?: string;
  telephone?: string;
  mail?: string;
  lien?: string;
}) => {
  const { id, ...rest } = payload;

  await updatePersonneProcheMutation.mutateAsync({
    id,
    ...rest,
    ...(rest.autresPrenoms !== undefined && {
      autresPrenoms: normalizeAutresPrenoms(rest.autresPrenoms),
    }),
  });
};

const handleReorderPersonneProche = async (payload: {
  id: string;
  direction: "up" | "down";
}) => {
  if (!patient.value) return;

  const current = [...personnesProches.value];
  const index = current.findIndex((p) => p.id === payload.id);
  if (index === -1) return;

  if (payload.direction === "up" && index > 0) {
    [current[index - 1], current[index]] = [current[index], current[index - 1]];
  } else if (payload.direction === "down" && index < current.length - 1) {
    [current[index], current[index + 1]] = [current[index + 1], current[index]];
  } else {
    return;
  }

  const ordrePayload = current.map((p, idx) => ({
    id: p.id,
    ordre: idx,
  }));

  await reorderPersonnesProchesMutation.mutateAsync({
    patientId: patient.value.id,
    ordre: ordrePayload,
  });
};

const demanderRemplissageMutationOptions =
  $orpc.demanderRemplissageInformation.mutationOptions();
const demanderRemplissageMutation = useMutation({
  ...demanderRemplissageMutationOptions,
  onSuccess: () => {
    toast.add({
      title: "Demande envoyée au patient",
      description:
        "Une notification et une tâche ont été créées pour le patient.",
    });
  },
  onError: (error: any) => {
    toast.add({
      title: "Erreur lors de l'envoi de la demande",
      description: error?.message || "Une erreur est survenue.",
      color: "error",
    });
  },
});

const handleDemanderRemplissage = async (
  section: "IDENTITE" | "COORDONNEES" | "CONJOINT" | "PERSONNES_PROCHES",
) => {
  if (!patient.value) return;

  await demanderRemplissageMutation.mutateAsync({
    patientId: patient.value.id,
    section,
  });
};

const demanderDocumentMutationOptions =
  $orpc.demanderDocumentPatient.mutationOptions();
const demanderDocumentMutation = useMutation({
  ...demanderDocumentMutationOptions,
  onSuccess: () => {
    toast.add({
      title: "Demande de document envoyée",
      description:
        "Une notification et une tâche ont été créées pour le patient.",
    });
  },
  onError: (error: any) => {
    toast.add({
      title: "Erreur lors de l'envoi de la demande",
      description: error?.message || "Une erreur est survenue.",
      color: "error",
    });
  },
});

const showDemandeDocumentModal = ref(false);

const handleDemanderDocument = () => {
  if (!patient.value) return;
  showDemandeDocumentModal.value = true;
};

const handleConfirmDemandeDocument = async (payload: {
  nomDocument: string;
  categorie: string;
}) => {
  if (!patient.value) return;

  await demanderDocumentMutation.mutateAsync({
    patientId: patient.value.id,
    nomDocument: payload.nomDocument,
    categorie: payload.categorie as any,
  });

  showDemandeDocumentModal.value = false;
};

const handleCancelDemandeDocument = () => {
  showDemandeDocumentModal.value = false;
};

// Confirmer les modifications
const confirmModifications = async () => {
  if (!patient.value) return;

  const updateData: any = {
    patientId: patient.value.id,
  };

  // Préparer les données d'identité
  if (pendingChanges.value.identite) {
    const identiteData: any = { ...pendingChanges.value.identite };

    // Convertir autresPrenoms et nationalites en tableaux si nécessaire
    if (
      identiteData.autresPrenoms &&
      typeof identiteData.autresPrenoms === "string"
    ) {
      identiteData.autresPrenoms = identiteData.autresPrenoms
        .split(",")
        .map((p: string) => p.trim())
        .filter((p: string) => p.length > 0);
    }
    if (
      identiteData.nationalites &&
      typeof identiteData.nationalites === "string"
    ) {
      identiteData.nationalites = identiteData.nationalites
        .split(",")
        .map((n: string) => n.trim())
        .filter((n: string) => n.length > 0);
    }

    updateData.informationIdentite = identiteData;
  }

  // Préparer les données de coordonnées
  if (pendingChanges.value.coordonnee) {
    updateData.informationCoordonnee = {
      ...pendingChanges.value.coordonnee,
    };
  }

  await updatePatientMutation.mutateAsync(updateData);
};

// Annuler les modifications
const cancelModifications = () => {
  showSummaryModal.value = false;
  pendingChanges.value = {};
  isEditingIdentite.value = false;
  isEditingCoordonnee.value = false;
};
</script>

<template>
  <div class="bg-[#f5f7fa]">
    <div
      v-if="isLoading"
      class="h-screen font--text flex items-center justify-center"
    >
      <p class="text-sm quaternary--text--color">Chargement du patient...</p>
    </div>
    <div
      v-else-if="isError || !patient"
      class="h-screen bg-white font--text flex items-center justify-center"
    >
      <p class="text-sm text-red-500">
        Patient non trouvé ou erreur de chargement.
      </p>
    </div>
    <div v-else class="h-screen font--text">
      <div class="flex h-full">
        <!-- Contenu principal -->
        <div class="flex-1 flex flex-col max-h-full">
          <!-- En-tête du patient -->
          <header class="shrink-0 border-b border-gray-200 px-8 py-6">
            <div class="flex items-center justify-between">
              <div>
                <h1
                  class="text-3xl font-bold secondary--text--color font--title"
                >
                  {{ patient.nom.toUpperCase() }} {{ patient.prenom }}
                  <span v-if="age" class="text-xl font-normal font--title">
                    ({{ age }} ans)
                  </span>
                </h1>
              </div>
              <div>
                <div class="mt-2 flex items-center gap-6">
                  <span class="text-sm quaternary--text--color">
                    Dossier n°{{ patient.dossierNumber }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Boutons Créer -->
            <div class="mt-6 flex items-center gap-4">
              <span class="text-sm font-medium secondary--text--color"
                >Créer :</span
              >
              <ButtonSecondary
                icon="i-lucide-plus"
                label="Nouvelle demande"
                bg_color="corail-soft-color"
                text_color="tertiary-color"
                @click="showNouvelleDemandeModal = true"
              />
              <ButtonSecondary
                icon="i-lucide-plus"
                label="Nouvel évènement"
                bg_color="sage-color"
                text_color="tertiary-color"
              />
              <ButtonSecondary
                icon="i-lucide-plus"
                label="Nouvel évènement"
                bg_color="mauve-brume-color"
                text_color="tertiary-color"
              />
            </div>
          </header>

          <!-- Contenu principal -->
          <main class="flex-1 flex flex-col px-8 py-6 overflow-hidden">
            <!-- Onglets -->
            <div class="mb-6 flex items-center justify-between shrink-0">
              <div class="flex gap-2">
                <button
                  v-for="tab in tabs"
                  :key="tab.id"
                  @click="activeTab = tab.id"
                  class="cursor-pointer inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                  :class="
                    activeTab === tab.id
                      ? 'bg-[#2e3a45] text-[#f5f7fa]'
                      : 'bg-[#a7c7e7] primary--text--color hover:bg-gray-200'
                  "
                >
                  <UIcon :name="tab.icon" class="h-4 w-4 font--title" />
                  {{ tab.label }}
                </button>
              </div>
            </div>
            <!-- Boutons Actions -->
            <div class="mb-4 flex gap-2 justify-end shrink-0">
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium secondary--text--color transition-colors hover:bg-gray-50"
              >
                <UIcon name="i-lucide-printer" class="h-4 w-4" />
                Imprimer
              </button>
            </div>

            <!-- Contenu de l'onglet -->
            <div class="flex-1 overflow-y-auto scrollbar-hide">
              <!-- Contenu de l'onglet Information -->
              <div v-if="activeTab === 'information'" class="space-y-4 pb-6">
                <!-- Section Identité -->
                <OngletInformationIdentite
                  :patient="patient"
                  :is-editing="isEditingIdentite"
                  :on-save="handleIdentiteChanges"
                  :can-request-fill="true"
                  @update:is-editing="isEditingIdentite = $event"
                  @request-fill="handleDemanderRemplissage('IDENTITE')"
                />
                <!-- Section Conjoint -->
                <OngletInformationConjoint
                  :patient="patient"
                  :can-request-fill="true"
                  @save="handleConjointChanges"
                  @request-fill="handleDemanderRemplissage('CONJOINT')"
                />
                <!-- Section Coordonnées -->
                <OngletInformationCoordonnee
                  :patient="patient"
                  :is-editing="isEditingCoordonnee"
                  :on-save="handleCoordonneeChanges"
                  :can-request-fill="true"
                  @update:is-editing="isEditingCoordonnee = $event"
                  @request-fill="handleDemanderRemplissage('COORDONNEES')"
                />
                <!-- Section Personnes proches -->
                <OngletInformationPersonnesProches
                  :personnes-proches="personnesProches"
                  :is-loading="isLoadingPersonnesProches"
                  :is-error="isErrorPersonnesProches"
                  @create="handleCreatePersonneProche"
                  @update="handleUpdatePersonneProche"
                  @reorder="handleReorderPersonneProche"
                />
              </div>

              <!-- Contenu de l'onglet Historique -->
              <div v-else-if="activeTab === 'historique'" class="pb-6">
                <OngletHistoriqueTimeline :evenements="historique" />
              </div>

              <!-- Contenu de l'onglet Document -->
              <div v-else-if="activeTab === 'document'" class="pb-6">
                <OngletInformationDocument
                  :patient-id="patientId"
                  :documents="patientDocuments"
                  :is-loading="isLoadingDocuments"
                  :is-error="isErrorDocuments"
                  :can-request-document="true"
                  :requested-documents="requestedDocuments"
                  @request-document="handleDemanderDocument"
                  @uploaded="() => {
                    queryClient.invalidateQueries({
                      queryKey: $orpc.listDocumentsByPatient.queryKey({
                        input: { patientId: patientId.value },
                      }),
                    });
                    queryClient.invalidateQueries({
                      queryKey: $orpc.listTachesByPatient.queryKey({
                        input: { patientId: patientId.value },
                      }),
                    });
                  }"
                />

                <ModalDemandeDocument
                  :is-open="showDemandeDocumentModal"
                  @confirm="handleConfirmDemandeDocument"
                  @cancel="handleCancelDemandeDocument"
                />
              </div>

              <!-- Contenu de l'onglet Tâche -->
              <div v-else-if="activeTab === 'tache'" class="pb-6 space-y-4">
                <div
                  v-if="isLoadingTaches"
                  class="rounded-lg border border-gray-200 bg-white p-8 text-center"
                >
                  <p class="text-sm quaternary--text--color">
                    Chargement des tâches...
                  </p>
                </div>

                <div
                  v-else-if="isErrorTaches"
                  class="rounded-lg border border-gray-200 bg-white p-8 text-center"
                >
                  <p class="text-sm text-red-500">
                    Erreur lors du chargement des tâches.
                  </p>
                </div>

                <div
                  v-else-if="formattedPatientTaches.length === 0"
                  class="rounded-lg border border-gray-200 bg-white p-8 text-center"
                >
                  <p class="text-sm quaternary--text--color">
                    Aucune tâche pour ce patient.
                  </p>
                </div>

                <div v-else class="space-y-4">
                  <TaskCard
                    v-for="task in formattedPatientTaches"
                    :key="task.id"
                    v-bind="task"
                  />
                </div>
              </div>

              <!-- Contenu de l'onglet Demande -->
              <div v-else-if="activeTab === 'demande'" class="pb-6 space-y-4">
                <OngletInformationDemande
                  :demandes="patientDemandes"
                  :is-loading="isLoadingDemandes"
                  :is-error="isErrorDemandes"
                  empty-text="Aucune demande pour ce patient."
                  :type-labels="typeDemandeLabels"
                  :statut-labels="statutDemandeLabels"
                  :statut-colors="statutDemandeColors"
                  :get-creator-name="getDemandeCreateur"
                  :format-date="formatDemandeDate"
                  :show-actions="true"
            @updateComment="handleUpdateCommentPatient"
                >
                  <template #actions="{ demande: d }">
                    <button
                      class="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium secondary--text--color transition-colors hover:bg-gray-50"
                      @click="
                        d.typeDemande === 'APA' && d.donneesFormulaire
                          ? generateApaPdfFromDemande(d.donneesFormulaire, {
                              download: false,
                            })
                          : navigateTo(
                              `/demande/${d.typeDemande.toLowerCase()}?demandeId=${d.id}`,
                            )
                      "
                    >
                      <UIcon name="i-lucide-file-text" class="h-3.5 w-3.5" />
                      Voir
                    </button>
                    <button
                      class="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium secondary--text--color transition-colors hover:bg-gray-50"
                      @click="
                        d.typeDemande === 'APA' && d.donneesFormulaire
                          ? generateApaPdfFromDemande(d.donneesFormulaire, {
                              download: true,
                            })
                          : navigateTo(
                              `/demande/${d.typeDemande.toLowerCase()}?demandeId=${d.id}&action=download`,
                            )
                      "
                    >
                      <UIcon name="i-lucide-download" class="h-3.5 w-3.5" />
                      Télécharger
                    </button>
                    <NuxtLink
                      v-if="d.statut !== 'TERMINEE' && d.statut !== 'ANNULEE'"
                      :to="`/demande/${d.typeDemande.toLowerCase()}?demandeId=${d.id}`"
                      class="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium secondary--text--color transition-colors hover:bg-gray-50"
                    >
                      <UIcon name="i-lucide-pencil" class="h-3.5 w-3.5" />
                      Modifier
                    </NuxtLink>
                    <button
                      v-if="d.statut === 'EN_ATTENTE_COMPLEMENT'"
                      @click="changeStatut(d.id, 'TERMINEE')"
                      :disabled="updateStatutMutation.isPending.value"
                      class="inline-flex items-center gap-1 rounded-lg border border-green-300 bg-white px-3 py-1.5 text-xs font-medium text-green-600 transition-colors hover:bg-green-50 disabled:opacity-50"
                    >
                      <UIcon name="i-lucide-check-circle" class="h-3.5 w-3.5" />
                      Terminer
                    </button>
                  </template>
                </OngletInformationDemande>
              </div>

              <!-- Contenu des autres onglets -->
              <div
                v-else
                class="rounded-lg border border-gray-200 bg-white p-8 text-center"
              >
                <p class="text-sm quaternary--text--color">
                  Contenu de l'onglet "{{
                    tabs.find((t) => t.id === activeTab)?.label
                  }}" à venir
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>

      <!-- Modal de résumé des modifications -->
      <OngletInformationModificationSummary
        :is-open="showSummaryModal"
        :changes="summaryChanges"
        :is-loading="updatePatientMutation.isPending.value"
        @confirm="confirmModifications"
        @cancel="cancelModifications"
      />
    </div>
    <NouvelleDemandeModal
      v-model="showNouvelleDemandeModal"
      :patient-id="patientId"
    />
  </div>
</template>
