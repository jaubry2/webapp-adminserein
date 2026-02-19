<script setup lang="ts">
import type { Patient } from "~/types/patient";
import type { Tache } from "~/types/tache";
import type { Document } from "~/types/document";
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import type { Change } from "~/components/OngletInformation/ModificationSummary.vue";

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
    return !!session.value?.data && !session.value.isPending && !!patientId.value;
  }),
});

// Mapping API -> type Patient utilisé par l'UI
const patient = computed<Patient | null>(() => {
  if (!apiPatient.value) return null;

  const p = apiPatient.value;
  const info = p.informationIdentite;
  const coord = p.informationCoordonnee;

  const dateNaissance =
    info?.dateNaissance instanceof Date
      ? info.dateNaissance.toLocaleDateString("fr-FR")
      : typeof info?.dateNaissance === "string"
        ? new Date(info.dateNaissance).toLocaleDateString("fr-FR")
        : "";

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
    return !!session.value?.data && !session.value.isPending && !!patientId.value;
  }),
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
    return !!session.value?.data && !session.value.isPending && !!patientId.value;
  }),
});

// Formater les tâches pour l'affichage
const formattedPatientTaches = computed(() => {
  if (!patientTaches.value) return [];

  return patientTaches.value.map((tache: Tache) => {
    const date = tache.date instanceof Date
      ? tache.date.toLocaleDateString("fr-FR")
      : typeof tache.date === "string"
        ? new Date(tache.date).toLocaleDateString("fr-FR")
        : "";

    const accentColor =
      tache.typeDemarche === "ADMINISTRATIVE" ||
      tache.typeDemarche === "SOCIALE" ||
      tache.typeDemarche === "LOGEMENT"
        ? "peach"
        : "lavender";

    const statusLabel =
      tache.etat === "TERMINEE"
        ? "Terminée"
        : tache.etat === "EN_COURS"
          ? "En cours"
          : tache.etat === "ANNULEE"
            ? "Annulée"
            : undefined;

    return {
      id: tache.id,
      label: `Démarche - ${getTypeDemarcheLabel(tache.typeDemarche)}`,
      patientName: `${patient.value?.nom} ${patient.value?.prenom}`,
      date,
      accentColor,
      statusLabel,
      tache,
    };
  });
});

// Fonction pour obtenir le label du type de démarche
const getTypeDemarcheLabel = (
  type: Tache["typeDemarche"]
): string => {
  const labels: Record<Tache["typeDemarche"], string> = {
    ADMINISTRATIVE: "Administrative",
    MEDICALE: "Médicale",
    SOCIALE: "Sociale",
    JURIDIQUE: "Juridique",
    LOGEMENT: "Logement",
    EMPLOI: "Emploi",
    AUTRE: "Autre",
  };
  return labels[type] || type;
};

const tabs = [
  { id: "information", label: "Information", icon: "i-lucide-info" },
  { id: "document", label: "Document", icon: "i-lucide-file-text" },
  { id: "historique", label: "Historique", icon: "i-lucide-clock" },
  { id: "tache", label: "Tâche", icon: "i-lucide-check-square" },
];

// État d'édition
const isEditingIdentite = ref(false);
const isEditingCoordonnee = ref(false);
const pendingChanges = ref<{
  identite?: Record<string, any>;
  coordonnee?: Record<string, any>;
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

// Fonction pour générer le résumé des modifications
const generateSummary = (
  identiteChanges?: Record<string, any>,
  coordonneeChanges?: Record<string, any>
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

// Gérer les changements d'identité
const handleIdentiteChanges = (changes: Record<string, any>) => {
  pendingChanges.value.identite = changes;
  // Générer le résumé avec tous les changements (identité + coordonnées si présents)
  summaryChanges.value = generateSummary(
    pendingChanges.value.identite,
    pendingChanges.value.coordonnee
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
    pendingChanges.value.coordonnee
  );
  // Afficher le modal seulement s'il y a des changements
  if (summaryChanges.value.length > 0) {
    showSummaryModal.value = true;
  }
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
    if (identiteData.autresPrenoms && typeof identiteData.autresPrenoms === "string") {
      identiteData.autresPrenoms = identiteData.autresPrenoms
        .split(",")
        .map((p: string) => p.trim())
        .filter((p: string) => p.length > 0);
    }
    if (identiteData.nationalites && typeof identiteData.nationalites === "string") {
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
  <div
    v-if="isLoading"
    class="h-screen bg-white font--text flex items-center justify-center"
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
  <div v-else class="h-screen bg-white font--text">
    <div class="flex h-full">
      <!-- Contenu principal -->
      <div class="flex-1 flex flex-col max-h-full">
        <!-- En-tête du patient -->
        <header class="shrink-0 border-b border-gray-200 bg-white px-8 py-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold secondary--text--color font--title">
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
                    : 'bg-gray-100 primary--text--color hover:bg-gray-200'
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
                @update:is-editing="isEditingIdentite = $event"
              />
              <!-- Section Coordonnées -->
              <OngletInformationCoordonnee
                :patient="patient"
                :is-editing="isEditingCoordonnee"
                :on-save="handleCoordonneeChanges"
                @update:is-editing="isEditingCoordonnee = $event"
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
              />
            </div>

            <!-- Contenu de l'onglet Tâche -->
            <div v-else-if="activeTab === 'tache'" class="pb-6 space-y-4">
              <div v-if="isLoadingTaches" class="rounded-lg border border-gray-200 bg-white p-8 text-center">
                <p class="text-sm quaternary--text--color">
                  Chargement des tâches...
                </p>
              </div>

              <div v-else-if="isErrorTaches" class="rounded-lg border border-gray-200 bg-white p-8 text-center">
                <p class="text-sm text-red-500">
                  Erreur lors du chargement des tâches.
                </p>
              </div>

              <div v-else-if="formattedPatientTaches.length === 0" class="rounded-lg border border-gray-200 bg-white p-8 text-center">
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
</template>
