<script setup lang="ts">
import type { Patient, PersonneProche } from "~/types/patient";
import type { Tache } from "~/types/tache";
import type { Document } from "~/types/document";
import { useQuery, useMutation, useQueryClient, skipToken } from "@tanstack/vue-query";
import { PDFDocument } from "pdf-lib";
import { getListFieldForm, getValue } from "~/composables/useInfoFormulaire";
import NouvelleDemandeModal from "~/components/NouvelleDemandeModal.vue";

definePageMeta({
  middleware: ["auth"],
});

const { $authClient, $orpc } = useNuxtApp();
const session = $authClient.useSession();
const toast = useToast();
const queryClient = useQueryClient();

// Récupérer le type d'utilisateur
const { data: userTypeData } = useQuery({
  ...$orpc.getUserType.queryOptions(),
  enabled: computed(() => !!session.value?.data && !session.value.isPending),
});

const isParticulier = computed(
  () => userTypeData.value?.type === "PARTICULIER",
);

// Rediriger si ce n'est pas un particulier
watchEffect(() => {
  if (userTypeData.value?.type && !isParticulier.value) {
    navigateTo("/dashboard", { replace: true });
  }
});

// Récupération du patient depuis l'API
const {
  data: apiPatient,
  isLoading,
  isError,
  refetch: refetchPatient,
} = useQuery({
  ...$orpc.getPatientByIdForParticulier.queryOptions(),
  enabled: computed(() => {
    return (
      !!session.value?.data && !session.value.isPending && isParticulier.value
    );
  }),
});

// Demandes d'accès au dossier pour ce patient
const {
  data: demandesAcces,
  isLoading: isLoadingDemandesAcces,
  isError: isErrorDemandesAcces,
  refetch: refetchDemandesAcces,
} = useQuery({
  ...$orpc.listDemandesAccesByPatient.queryOptions(),
  enabled: computed(() => {
    return (
      !!session.value?.data && !session.value.isPending && isParticulier.value
    );
  }),
});

// Professionnels ayant accès au dossier du patient
const {
  data: professionnelsAcces,
  isLoading: isLoadingProfessionnelsAcces,
  isError: isErrorProfessionnelsAcces,
  refetch: refetchProfessionnelsAcces,
} = useQuery({
  ...$orpc.listProfessionnelsByParticulier.queryOptions(),
  enabled: computed(() => {
    return (
      !!session.value?.data && !session.value.isPending && isParticulier.value
    );
  }),
});

const repondreDemandeAccesMutationOptions =
  $orpc.repondreDemandeAcces.mutationOptions();
const repondreDemandeAccesMutation = useMutation({
  ...repondreDemandeAccesMutationOptions,
  onSuccess: async () => {
    await refetchDemandesAcces();
    toast.add({
      title: "Réponse enregistrée",
      description: "Votre choix a bien été pris en compte.",
    });
  },
  onError: (error: any) => {
    toast.add({
      title: "Erreur",
      description: error?.message || "Une erreur est survenue.",
      color: "error",
    });
  },
});

// Récupération des tâches
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

const { data: tachesData } = useQuery({
  ...$orpc.listTachesByParticulier.queryOptions(),
  enabled: computed(() => {
    return (
      !!session.value?.data && !session.value.isPending && isParticulier.value
    );
  }),
}) as { data: Ref<Tache[] | undefined> };

// Récupération des documents
const { data: documentsData } = useQuery({
  ...$orpc.listDocumentsByParticulier.queryOptions(),
  enabled: computed(() => {
    return (
      !!session.value?.data && !session.value.isPending && isParticulier.value
    );
  }),
}) as { data: Ref<Document[] | undefined> };

// Personnes proches pour le patient connecté
const {
  data: personnesProchesData,
  isLoading: isLoadingPersonnesProches,
  isError: isErrorPersonnesProches,
  refetch: refetchPersonnesProches,
} = useQuery({
  ...$orpc.listPersonnesProchesByParticulier.queryOptions(),
  enabled: computed(() => {
    return (
      !!session.value?.data && !session.value.isPending && isParticulier.value
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

// Demandes liées au patient du particulier
const patientIdForDemandes = computed(() => apiPatient.value?.id ?? null);

const {
  data: patientDemandes,
  isLoading: isLoadingDemandes,
  isError: isErrorDemandes,
} = useQuery(
  computed(() => ({
    ...$orpc.listDemandesByPatient.queryOptions({
      input: patientIdForDemandes.value
        ? { patientId: patientIdForDemandes.value }
        : skipToken,
    }),
    enabled:
      !!session.value?.data &&
      !session.value.isPending &&
      isParticulier.value &&
      !!patientIdForDemandes.value,
  }))
);

const showNouvelleDemandeModal = ref(false);

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
  EN_ATTENTE_COMPLEMENT: "En attente de complément",
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

const getDemandeCreateur = (d: any): string => {
  if (d.professionnelInfo) {
    return `${d.professionnelInfo.prenom} ${d.professionnelInfo.nom}`;
  }
  return "Moi-même";
};

const formatDemandeDate = (dateStr: string | Date): string => {
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const showCompleterModal = ref(false);
const completerDemandeId = ref<string | null>(null);
const completerNomBeneficiaire = ref("");
const completerPrenomBeneficiaire = ref("");
const completerDetails = ref("");
const completerReponse = ref("");
const completerCommentairePro = ref("");

const openCompleterModal = (d: any) => {
  completerDemandeId.value = d.id;
  completerNomBeneficiaire.value = d.nomBeneficiaire || "";
  completerPrenomBeneficiaire.value = d.prenomBeneficiaire || "";
  completerDetails.value = d.details || "";
  completerReponse.value = "";
  completerCommentairePro.value = d.commentaireComplement || "";
  showCompleterModal.value = true;
};

const completerDemandeMutation = useMutation({
  ...$orpc.completerDemande.mutationOptions(),
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ["listDemandesByPatient"],
    });
    toast.add({
      title: "Informations envoyées",
      description: "Le professionnel a été notifié de votre complément.",
    });
    showCompleterModal.value = false;
  },
  onError: (error: any) => {
    toast.add({
      title: "Erreur",
      description: error?.message || "Impossible d'envoyer le complément.",
      color: "error",
    });
  },
});

const submitComplement = async () => {
  if (!completerDemandeId.value) return;
  await completerDemandeMutation.mutateAsync({
    demandeId: completerDemandeId.value,
    nomBeneficiaire: completerNomBeneficiaire.value || undefined,
    prenomBeneficiaire: completerPrenomBeneficiaire.value || undefined,
    details: completerDetails.value || undefined,
    reponseComplement: completerReponse.value || undefined,
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
    // libérer l'URL plus tard
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
};

const handleViewDemandeDocument = (d: any) => {
  if (d.typeDemande === "APA" && d.donneesFormulaire) {
    generateApaPdfFromDemande(d.donneesFormulaire, { download: false });
    return;
  }

  navigateTo(`/demande/${d.typeDemande.toLowerCase()}?demandeId=${d.id}`);
};

const handleDownloadDemandeDocument = (d: any) => {
  if (d.typeDemande === "APA" && d.donneesFormulaire) {
    generateApaPdfFromDemande(d.donneesFormulaire, { download: true });
    return;
  }

  navigateTo(
    `/demande/${d.typeDemande.toLowerCase()}?demandeId=${d.id}&action=download`,
  );
};

const createPersonneProcheParticulierMutationOptions =
  $orpc.createPersonneProcheByParticulier.mutationOptions();
const createPersonneProcheParticulierMutation = useMutation({
  ...createPersonneProcheParticulierMutationOptions,
  onSuccess: async () => {
    await refetchPersonnesProches();
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

const updatePersonneProcheParticulierMutationOptions =
  $orpc.updatePersonneProcheByParticulier.mutationOptions();
const updatePersonneProcheParticulierMutation = useMutation({
  ...updatePersonneProcheParticulierMutationOptions,
  onSuccess: async () => {
    await refetchPersonnesProches();
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

const reorderPersonnesProchesParticulierMutationOptions =
  $orpc.reorderPersonnesProchesByParticulier.mutationOptions();
const reorderPersonnesProchesParticulierMutation = useMutation({
  ...reorderPersonnesProchesParticulierMutationOptions,
  onSuccess: async () => {
    await refetchPersonnesProches();
  },
  onError: (error: any) => {
    toast.add({
      title: "Erreur lors du réordonnancement",
      description: error?.message || "Une erreur est survenue.",
      color: "error",
    });
  },
});

// Mutation pour mettre à jour les informations du patient (par ex. conjoint)
const updatePatientMutationOptions = $orpc.updatePatient.mutationOptions();
const updatePatientMutation = useMutation({
  ...updatePatientMutationOptions,
  onSuccess: async () => {
    await refetchPatient();
    toast.add({
      title: "Informations mises à jour",
      description: "Vos informations ont été mises à jour.",
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

const handleCreatePersonneProcheParticulier = async (payload: {
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
  await createPersonneProcheParticulierMutation.mutateAsync({
    personne: {
      ...payload,
      autresPrenoms: normalizeAutresPrenoms(payload.autresPrenoms),
    },
  });
};

const handleUpdatePersonneProcheParticulier = async (payload: {
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

  await updatePersonneProcheParticulierMutation.mutateAsync({
    id,
    ...rest,
    ...(rest.autresPrenoms !== undefined && {
      autresPrenoms: normalizeAutresPrenoms(rest.autresPrenoms),
    }),
  });
};

const handleReorderPersonneProcheParticulier = async (payload: {
  id: string;
  direction: "up" | "down";
}) => {
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

  await reorderPersonnesProchesParticulierMutation.mutateAsync({
    ordre: ordrePayload,
  });
};

// Gestion des changements de conjoint pour le particulier
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

const removeProfessionnelMutationOptions =
  $orpc.removeProfessionnelByParticulier.mutationOptions();
const removeProfessionnelMutation = useMutation({
  ...removeProfessionnelMutationOptions,
  onSuccess: async () => {
    await refetchProfessionnelsAcces();
    toast.add({
      title: "Suivi interrompu",
      description:
        "Le professionnel sélectionné n'a plus accès à votre dossier.",
    });
  },
  onError: (error: any) => {
    toast.add({
      title: "Erreur lors de la suppression",
      description: error?.message || "Une erreur est survenue.",
      color: "error",
    });
  },
});

const handleRemoveProfessionnel = (professionnelId: string) => {
  if (
    !confirm(
      "Êtes-vous sûr de vouloir retirer ce professionnel de votre dossier ?",
    )
  ) {
    return;
  }

  removeProfessionnelMutation.mutate({
    professionnelId,
  });
};

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
  if (!patient.value?.dateNaissance) return null;
  const birthDate = new Date(patient.value.dateNaissance);
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
});

const activeTab = ref("information");

const tabs = [
  { id: "information", label: "Information", icon: "i-lucide-info" },
  { id: "document", label: "Document", icon: "i-lucide-file-text" },
  { id: "tache", label: "Tâche", icon: "i-lucide-check-square" },
  { id: "demande", label: "Demande", icon: "i-lucide-folder-open" },
  { id: "acces", label: "Accès", icon: "i-lucide-shield-check" },
];

// Fonction pour obtenir la couleur d'accent selon le type de démarche
const getAccentColorByType = (
  type: Tache["typeDemarche"],
): TaskAccentColor => {
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
    case "AUTRE":
    default:
      return "slate";
  }
};
</script>

<template>
  <div class="min-h-svh px-10 py-10 font--text">
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <UIcon
        name="i-lucide-loader-2"
        class="animate-spin text-4xl text-primary"
      />
      <span class="ml-4 text-muted">Chargement...</span>
    </div>

    <div v-else-if="isError" class="flex items-center justify-center py-12">
      <p class="text-red-500">Erreur lors du chargement des informations</p>
    </div>

    <div v-else-if="patient" class="mx-auto max-w-5xl space-y-6">
      <!-- En-tête -->
      <header class="space-y-2">
        <h1 class="text-3xl font-bold secondary--text--color">
          {{ patient.prenom }} {{ patient.nom }}
        </h1>
        <div class="flex items-center gap-4 text-sm quaternary--text--color">
          <span>Dossier n°{{ patient.dossierNumber }}</span>
          <span v-if="age">• {{ age }} ans</span>
        </div>
      </header>

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

      <!-- Contenu des onglets -->
      <div class="space-y-6">
        <!-- Onglet Information -->
        <div v-if="activeTab === 'information'" class="space-y-6">
          <OngletInformationIdentite
            :patient="patient"
            :is-editing="false"
            @save="() => {}"
            @cancel="() => {}"
          />
          <OngletInformationConjoint
            :patient="patient"
            @save="handleConjointChanges"
          />
          <OngletInformationCoordonnee
            :patient="patient"
            :is-editing="false"
            @save="() => {}"
            @cancel="() => {}"
          />
          <OngletInformationPersonnesProches
            :personnes-proches="personnesProches"
            :is-loading="isLoadingPersonnesProches"
            :is-error="isErrorPersonnesProches"
            @create="handleCreatePersonneProcheParticulier"
            @update="handleUpdatePersonneProcheParticulier"
            @reorder="handleReorderPersonneProcheParticulier"
          />
        </div>

        <!-- Onglet Document -->
        <div v-if="activeTab === 'document'">
          <OngletInformationDocument
            :patient-id="patient.id"
            :documents="documentsData || []"
            :is-loading="false"
            :is-error="false"
          />
        </div>

        <!-- Onglet Tâche -->
        <div v-if="activeTab === 'tache'" class="space-y-4">
          <h2 class="text-lg font-semibold secondary--text--color">
            Mes tâches
          </h2>
          <div
            v-if="!tachesData || tachesData.length === 0"
            class="text-center py-8"
          >
            <p class="text-sm quaternary--text--color">
              Aucune tâche pour le moment
            </p>
          </div>
          <div v-else class="space-y-4">
            <TaskCard
              v-for="tache in tachesData"
              :key="tache.id"
              :id="tache.id"
              :label="`${tache.typeDemarche} - ${tache.details}`"
              :patient-name="
                tache.patient?.informationIdentite
                  ? `${tache.patient.informationIdentite.prenom} ${tache.patient.informationIdentite.nomUsage}`
                  : 'N/A'
              "
              :date="
                tache.date instanceof Date
                  ? tache.date.toLocaleDateString('fr-FR')
                  : new Date(tache.date).toLocaleDateString('fr-FR')
              "
              :accent-color="getAccentColorByType(tache.typeDemarche)"
              :status-label="
                tache.etat === 'TERMINEE'
                  ? 'Terminée'
                  : tache.etat === 'EN_COURS'
                    ? 'En cours'
                    : tache.etat === 'ANNULEE'
                      ? 'Annulée'
                      : tache.etat === 'A_FAIRE'
                        ? 'À faire'
                        : undefined
              "
              :tache="tache"
            />
          </div>
        </div>

        <!-- Onglet Demande -->
        <div v-if="activeTab === 'demande'" class="space-y-4">
          <div class="flex justify-end">
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-lg bg-[var(--primary-color)] px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:opacity-90"
              @click="showNouvelleDemandeModal = true"
            >
              <UIcon name="i-lucide-plus" class="h-3.5 w-3.5" />
              Nouvelle demande
            </button>
          </div>

          <OngletInformationDemande
            title="Mes demandes"
            :demandes="patientDemandes"
            :is-loading="isLoadingDemandes"
            :is-error="isErrorDemandes"
            empty-text="Aucune demande pour le moment."
            :type-labels="typeDemandeLabels"
            :statut-labels="statutDemandeLabels"
            :statut-colors="statutDemandeColors"
            :get-creator-name="getDemandeCreateur"
            :format-date="formatDemandeDate"
            :show-actions="true"
          >
            <template #actions="{ demande: d }">
              <div class="flex items-center justify-end gap-2">
                <button
                  class="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium secondary--text--color transition-colors hover:bg-gray-50"
                  @click="handleViewDemandeDocument(d)"
                >
                  <UIcon name="i-lucide-file-text" class="h-3.5 w-3.5" />
                  Voir
                </button>
                <button
                  class="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium secondary--text--color transition-colors hover:bg-gray-50"
                  @click="handleDownloadDemandeDocument(d)"
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
                  @click="openCompleterModal(d)"
                  class="inline-flex items-center gap-1 rounded-lg border border-orange-300 bg-white px-3 py-1.5 text-xs font-medium text-orange-600 transition-colors hover:bg-orange-50"
                >
                  <UIcon name="i-lucide-edit" class="h-3.5 w-3.5" />
                  Compléter
                </button>
              </div>
            </template>
          </OngletInformationDemande>

          <NouvelleDemandeModal
            v-model="showNouvelleDemandeModal"
            :patient-id="patient?.id ?? null"
          />
        </div>

        <!-- Onglet Accès -->
        <div v-if="activeTab === 'acces'" class="space-y-6">
          <!-- Professionnels ayant accès -->
          <div class="space-y-3">
            <h2 class="text-lg font-semibold secondary--text--color">
              Professionnels ayant accès à mon dossier
            </h2>
            <div
              v-if="isLoadingProfessionnelsAcces"
              class="text-sm quaternary--text--color"
            >
              Chargement des professionnels...
            </div>
            <div
              v-else-if="isErrorProfessionnelsAcces"
              class="text-sm text-red-500"
            >
              Erreur lors du chargement des professionnels.
            </div>
            <div
              v-else-if="
                !professionnelsAcces || professionnelsAcces.length === 0
              "
              class="text-sm quaternary--text--color"
            >
              Aucun professionnel n’a actuellement accès à votre dossier.
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="pro in professionnelsAcces"
                :key="pro.id"
                class="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 gap-3"
              >
                <div class="flex-1">
                  <p class="text-sm font-medium secondary--text--color">
                    {{ pro.prenom }} {{ pro.nom }}
                  </p>
                  <p class="text-xs quaternary--text--color">
                    {{ pro.fonction || "Professionnel" }}
                  </p>
                </div>
                <div class="flex items-center gap-4">
                  <div class="text-xs quaternary--text--color text-right">
                    <p v-if="pro.dateAttribution">
                      Depuis
                      {{
                        new Date(pro.dateAttribution).toLocaleDateString(
                          "fr-FR",
                        )
                      }}
                    </p>
                  </div>
                  <button
                    type="button"
                    class="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                    @click="handleRemoveProfessionnel(pro.id)"
                  >
                    Retirer l'accès
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Demandes d'accès -->
          <div class="space-y-4">
            <h2 class="text-lg font-semibold secondary--text--color">
              Demandes d'accès à mon dossier
            </h2>
            <div
              v-if="isLoadingDemandesAcces"
              class="text-sm quaternary--text--color"
            >
              Chargement des demandes d'accès...
            </div>
            <div v-else-if="isErrorDemandesAcces" class="text-sm text-red-500">
              Erreur lors du chargement des demandes d'accès.
            </div>
            <div
              v-else-if="!demandesAcces || demandesAcces.length === 0"
              class="text-sm quaternary--text--color"
            >
              Aucune demande d'accès en attente.
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="demande in demandesAcces"
                :key="demande.id"
                class="rounded-lg border border-gray-200 bg-white px-4 py-3 flex flex-col gap-2"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium secondary--text--color">
                      {{ demande.professionnel?.prenom }}
                      {{ demande.professionnel?.nom }}
                    </p>
                    <p class="text-xs quaternary--text--color">
                      {{ demande.professionnel?.fonction || "Professionnel" }}
                    </p>
                  </div>
                  <span
                    class="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200"
                  >
                    En attente
                  </span>
                </div>
                <div class="flex gap-2 justify-end mt-2">
                  <button
                    type="button"
                    class="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    @click="
                      repondreDemandeAccesMutation.mutate({
                        demandeId: demande.id,
                        decision: 'REFUSER',
                      })
                    "
                  >
                    Refuser
                  </button>
                  <button
                    type="button"
                    class="px-3 py-1.5 rounded-lg bg-[var(--primary-color)] text-xs font-medium text-white hover:opacity-90 transition-colors"
                    @click="
                      repondreDemandeAccesMutation.mutate({
                        demandeId: demande.id,
                        decision: 'ACCEPTER',
                      })
                    "
                  >
                    Accepter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal compléter une demande -->
    <div
      v-if="showCompleterModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      @click.self="showCompleterModal = false"
    >
      <div class="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 class="text-lg font-semibold secondary--text--color mb-2">
          Compléter la demande
        </h2>

        <div
          v-if="completerCommentairePro"
          class="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-3"
        >
          <p class="text-xs font-medium text-orange-700 mb-1">
            Message du professionnel :
          </p>
          <p class="text-sm text-orange-800">
            {{ completerCommentairePro }}
          </p>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium quaternary--text--color mb-1">
              Nom du bénéficiaire
            </label>
            <input
              v-model="completerNomBeneficiaire"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm secondary--text--color input-focus-primary"
              placeholder="Nom"
            />
          </div>
          <div>
            <label class="block text-sm font-medium quaternary--text--color mb-1">
              Prénom du bénéficiaire
            </label>
            <input
              v-model="completerPrenomBeneficiaire"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm secondary--text--color input-focus-primary"
              placeholder="Prénom"
            />
          </div>
          <div>
            <label class="block text-sm font-medium quaternary--text--color mb-1">
              Détails
            </label>
            <textarea
              v-model="completerDetails"
              rows="3"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm secondary--text--color input-focus-primary resize-none"
              placeholder="Informations complémentaires"
            />
          </div>
          <div>
            <label class="block text-sm font-medium quaternary--text--color mb-1">
              Votre réponse au professionnel
            </label>
            <textarea
              v-model="completerReponse"
              rows="3"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm secondary--text--color input-focus-primary resize-none"
              placeholder="Ex : Voici les informations demandées..."
            />
          </div>
        </div>

        <div class="mt-4 flex items-center justify-end gap-3">
          <button
            @click="showCompleterModal = false"
            class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium quaternary--text--color transition-colors hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            @click="submitComplement"
            :disabled="completerDemandeMutation.isPending.value"
            class="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="completerDemandeMutation.isPending.value">Envoi...</span>
            <span v-else>Envoyer le complément</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
