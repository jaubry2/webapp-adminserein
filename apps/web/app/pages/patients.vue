<script setup lang="ts">
import type { Patient } from "~/types/patient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";

const { $authClient, $orpc } = useNuxtApp();
const queryClient = useQueryClient();
const toast = useToast();

definePageMeta({
  middleware: ["auth"],
});

// Récupération des patients depuis l'API oRPC
const {
  data: apiPatients,
  isLoading,
  isError,
} = useQuery($orpc.listPatients.queryOptions());

// Mapping des données API -> type Patient utilisé par l'UI
const patients = computed<Patient[]>(() => {
  if (!apiPatients.value) return [];

  return apiPatients.value.map((p) => {
    const info = p.informationIdentite;

    // Formatage simple de la date au format JJ/MM/AAAA
    const dateNaissance =
      info?.dateNaissance && typeof info.dateNaissance === "object" && "toLocaleDateString" in info.dateNaissance
        ? (info.dateNaissance as Date).toLocaleDateString("fr-FR")
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
      // Champs non encore présents en base
      telephone: undefined,
      email: undefined,
      adresse: undefined,
      codePostal: undefined,
      ville: undefined,
      // TODO: utiliser un champ "updatedAt" en base si besoin
      dernieresModifications: "",
    };
  });
});

const searchQuery = ref("");

// Filtrer les patients selon la recherche
const filteredPatients = computed(() => {
  const all = patients.value;
  if (!searchQuery.value) {
    return all;
  }
  const query = searchQuery.value.toLowerCase();
  return all.filter(
    (patient) =>
      patient.nom.toLowerCase().includes(query) ||
      patient.prenom.toLowerCase().includes(query) ||
      patient.dossierNumber.includes(query),
  );
});

const selectedPatients = ref<string[]>([]);

const togglePatientSelection = (patientId: string) => {
  const index = selectedPatients.value.indexOf(patientId);
  if (index > -1) {
    selectedPatients.value.splice(index, 1);
  } else {
    selectedPatients.value.push(patientId);
  }
};

const toggleAllSelection = () => {
  if (selectedPatients.value.length === filteredPatients.value.length) {
    selectedPatients.value = [];
  } else {
    selectedPatients.value = filteredPatients.value.map((p) => p.id);
  }
};

const isAllSelected = computed(() => {
  return (
    filteredPatients.value.length > 0 &&
    selectedPatients.value.length === filteredPatients.value.length
  );
});

// État du modal d'ajout de patient
const isModalOpen = ref(false);

const openModal = () => {
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  modalError.value = "";
};

// Mutation pour créer un patient
// Utiliser mutationOptions pour obtenir la mutationFn qui gère correctement les credentials
const mutationOptions = $orpc.createPatient.mutationOptions();
const createPatientMutation = useMutation({
  ...mutationOptions,
  onSuccess: () => {
    // Rafraîchir la liste des patients
    queryClient.invalidateQueries({
      queryKey: $orpc.listPatients.queryKey(),
    });
    toast.add({
      title: "Patient créé avec succès",
      description: "Le patient a été ajouté à votre liste.",
    });
    closeModal();
  },
  onError: (error: any) => {
    toast.add({
      title: "Erreur lors de la création",
      description: error?.message || "Une erreur est survenue.",
      color: "error",
    });
  },
});

// État pour gérer l'erreur de numéro invalide dans le modal
const modalError = ref("");

// Mutation pour ajouter un patient existant à la liste du professionnel
const addPatientMutationOptions = $orpc.addPatientToProfessional.mutationOptions();
const addPatientMutation = useMutation({
  ...addPatientMutationOptions,
  onSuccess: () => {
    // Rafraîchir la liste des patients
    queryClient.invalidateQueries({
      queryKey: $orpc.listPatients.queryKey(),
    });
    toast.add({
      title: "Patient ajouté avec succès",
      description: "Le patient a été ajouté à votre liste.",
    });
    closeModal();
    // Fermer aussi le popup de confirmation si ouvert
    showSearchResult.value = false;
    searchResultPatient.value = null;
    modalError.value = "";
  },
  onError: (error: any) => {
    // Si le patient n'est pas trouvé, afficher l'erreur dans le modal
    if (error?.message?.includes("non trouvé")) {
      modalError.value = "Numéro de dossier incorrect. Ce patient n'existe pas dans le système.";
      // Ne pas fermer le modal pour permettre à l'utilisateur de corriger
    } else {
      toast.add({
        title: "Erreur lors de l'ajout",
        description: error?.message || "Une erreur est survenue.",
        color: "error",
      });
    }
  },
});

// Mutation pour rechercher un patient par ses informations
const searchPatientMutationOptions = $orpc.searchPatientByInfo.mutationOptions();
const searchPatientMutation = useMutation({
  ...searchPatientMutationOptions,
  onSuccess: (results) => {
    if (results && results.length > 0) {
      // Afficher le popup de confirmation avec le premier résultat
      searchResultPatient.value = results[0];
      showSearchResult.value = true;
    } else {
      toast.add({
        title: "Aucun patient trouvé",
        description: "Aucun patient ne correspond aux informations fournies. Vous pouvez créer un nouveau patient.",
        color: "warning",
      });
    }
  },
  onError: (error: any) => {
    toast.add({
      title: "Erreur lors de la recherche",
      description: error?.message || "Une erreur est survenue.",
      color: "error",
    });
  },
});

// Mutation pour retirer un patient de la liste
const removePatientMutationOptions = $orpc.removePatientFromProfessional.mutationOptions();
const removePatientMutation = useMutation({
  ...removePatientMutationOptions,
  onSuccess: () => {
    // Rafraîchir la liste des patients
    queryClient.invalidateQueries({
      queryKey: $orpc.listPatients.queryKey(),
    });
    toast.add({
      title: "Patient retiré",
      description: "Le patient a été retiré de votre liste.",
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

// État pour le popup de confirmation
const showSearchResult = ref(false);
const searchResultPatient = ref<any>(null);

// Fonction pour générer un numéro de dossier automatique
const generateDossierNumber = async (): Promise<string> => {
  // Récupérer la liste des patients depuis le cache ou l'API
  const patients =
    apiPatients.value ||
    (await queryClient.fetchQuery($orpc.listPatients.queryOptions()));

  if (!patients || patients.length === 0) {
    return "DOSSIER-0001";
  }

  // Extraire les numéros et trouver le plus grand
  const numbers = patients
    .map((p) => {
      const dossierNum = p.numeroDossier;
      if (!dossierNum) return 0;
      const match = dossierNum.match(/(\d+)$/);
      return match ? parseInt(match[1] as string, 10) : 0;
    })
    .filter((n) => n > 0);

  const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
  const nextNumber = maxNumber + 1;
  return `DOSSIER-${String(nextNumber).padStart(4, "0")}`;
};

const handleSubmitPatient = async (data: any) => {
  // Réinitialiser l'erreur du modal
  modalError.value = "";
  
  try {
    // Cas 1 : Connaît le numéro de dossier
    if (data.connaitDossierNumber && data.dossierNumber) {
      await addPatientMutation.mutateAsync({
        numeroDossier: data.dossierNumber as string,
      });
      return;
    }

    // Cas 2 : Recherche par informations (patient a un dossier mais on ne connaît pas le numéro)
    if (!data.connaitDossierNumber && data.searchMode && data.patientADossier === "oui") {
      // Convertir la date au format ISO si nécessaire
      let dateNaissanceISO = data.dateNaissance;
      if (dateNaissanceISO && dateNaissanceISO.includes("/")) {
        const [day, month, year] = dateNaissanceISO.split("/");
        dateNaissanceISO = `${year}-${month}-${day}`;
      }

      await searchPatientMutation.mutateAsync({
        dateNaissance: dateNaissanceISO,
        prenom: data.prenom,
        nom: data.nomUsage,
        numeroSecuriteSociale: data.numeroSecuriteSociale,
      });
      return;
    }

    // Cas 3 : Création d'un nouveau patient (pas de dossier ou je ne sais pas)
    let numeroDossier = await generateDossierNumber();

    // Convertir la date de naissance au format ISO si nécessaire
    let dateNaissanceISO = data.dateNaissance;
    if (dateNaissanceISO && dateNaissanceISO.includes("/")) {
      const [day, month, year] = dateNaissanceISO.split("/");
      dateNaissanceISO = `${year}-${month}-${day}`;
    }

    const patientData = {
      numeroDossier,
      informationIdentite: {
        nomUsage: data.nomUsage || "",
        nomNaissance: data.nomNaissance || data.nomUsage || "",
        prenom: data.prenom || "",
        autresPrenoms: data.autresPrenoms
          ? data.autresPrenoms.split(",").map((p: string) => p.trim())
          : [],
        genre: (data.genre || "AUTRE") as "MASCULIN" | "FEMININ" | "AUTRE",
        dateNaissance: dateNaissanceISO,
        villeNaissance: data.villeNaissance || "",
        departementNaissance: data.departementNaissance || "",
        paysNaissance: data.paysNaissance || "",
        nationalites: data.nationalites
          ? data.nationalites.split(",").map((n: string) => n.trim())
          : [],
        numeroSecuriteSociale: data.numeroSecuriteSociale || "",
        situationFamiliale: (data.situationFamiliale ||
          "CELIBATAIRE") as
          | "CELIBATAIRE"
          | "MARIE"
          | "DIVORCE"
          | "VEUF"
          | "PACSE"
          | "CONCUBINAGE",
      },
      informationCoordonnee: {
        adresse: data.adresse || "",
        informationComplementaires: data.informationComplementaires || undefined,
        codePostal: data.codePostal || "",
        ville: data.ville || "",
        departement: data.departement || "",
        pays: data.pays || "",
        numeroTelephone: data.numeroTelephone || "",
        adresseMail: data.adresseMail || "",
      },
    };

    await createPatientMutation.mutateAsync(patientData);
  } catch (error: any) {
    console.error("Erreur lors du traitement:", error);
  }
};

// Gérer la confirmation du popup de recherche
const handleConfirmSearchResult = async () => {
  if (searchResultPatient.value?.numeroDossier) {
    await addPatientMutation.mutateAsync({
      numeroDossier: searchResultPatient.value.numeroDossier,
    });
  }
};

const handleCancelSearchResult = () => {
  showSearchResult.value = false;
  searchResultPatient.value = null;
};

// État pour la confirmation de suppression
const showDeleteConfirm = ref(false);
const patientToDelete = ref<{ id: string; nom: string; prenom: string } | null>(null);

// Gérer la suppression d'un patient
const handleRemovePatient = (patientId: string, nom: string, prenom: string) => {
  patientToDelete.value = { id: patientId, nom, prenom };
  showDeleteConfirm.value = true;
};

const confirmDeletePatient = async () => {
  if (!patientToDelete.value) return;

  try {
    await removePatientMutation.mutateAsync({
      patientId: patientToDelete.value.id,
    });
    showDeleteConfirm.value = false;
    patientToDelete.value = null;
  } catch (error: any) {
    // L'erreur est déjà gérée dans la mutation
  }
};

const cancelDeletePatient = () => {
  showDeleteConfirm.value = false;
  patientToDelete.value = null;
};
</script>

<template>
  <div class="min-h-screen bg-white px-8 py-8 text--color">
    <div class="mx-auto max-w-7xl">
      <!-- En-tête de la page -->
      <header class="mb-6">
        <h1 class="text-3xl font-bold secondary--text--color mb-4 font--title">
          Liste de mes patients
        </h1>

        <ButtonSecondary
          icon="i-lucide-plus"
          label="Ajouter un nouveau patient"
          bg_color="corail-soft-color"
          text_color="tertiary-color"
          @click="openModal"
        />
      </header>

      <!-- Conteneur du tableau -->
      <div class="rounded-lg border border-gray-200 bg-white shadow-sm">
        <!-- Barre de recherche -->
        <div class="border-b border-gray-200 p-4">
          <div class="relative">
            <UIcon
              name="i-lucide-search"
              class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher"
              class="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <!-- Tableau -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <!-- En-têtes du tableau -->
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    :checked="isAllSelected"
                    @change="toggleAllSelection"
                    class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </th>
                <th
                  class="px-6 py-4 text-left text-sm font-semibold secondary--text--color"
                >
                  Numéro de dossier
                </th>
                <th
                  class="px-6 py-4 text-left text-sm font-semibold secondary--text--color"
                >
                  Nom
                </th>
                <th
                  class="px-6 py-4 text-left text-sm font-semibold secondary--text--color"
                >
                  Prénom
                </th>
                <th
                  class="px-6 py-4 text-left text-sm font-semibold secondary--text--color"
                >
                  Date de naissance
                </th>
                <th
                  class="px-6 py-4 text-left text-sm font-semibold secondary--text--color"
                >
                  Dernières modifications
                </th>
                <th
                  class="px-6 py-4 text-right text-sm font-semibold secondary--text--color"
                >
                  Actions
                </th>
              </tr>
            </thead>

            <!-- Corps du tableau -->
            <tbody class="divide-y divide-gray-200 bg-white">
              <tr v-if="isLoading">
                <td colspan="7" class="px-6 py-12 text-center">
                  <p class="text-sm quaternary--text--color">
                    Chargement des patients...
                  </p>
                </td>
              </tr>
              <tr v-else-if="isError">
                <td colspan="7" class="px-6 py-12 text-center">
                  <p class="text-sm text-red-500">
                    Erreur lors du chargement des patients.
                  </p>
                </td>
              </tr>
              <tr
                v-for="patient in filteredPatients"
                v-else
                :key="patient.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-4">
                  <input
                    type="checkbox"
                    :checked="selectedPatients.includes(patient.id)"
                    @change="togglePatientSelection(patient.id)"
                    class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </td>
                <td class="px-6 py-4 text-sm quaternary--text--color">
                  {{ patient.dossierNumber }}
                </td>
                <td
                  class="px-6 py-4 text-sm font-medium secondary--text--color"
                >
                  {{ patient.nom }}
                </td>
                <td
                  class="px-6 py-4 text-sm font-medium secondary--text--color"
                >
                  {{ patient.prenom }}
                </td>
                <td class="px-6 py-4 text-sm quaternary--text--color">
                  {{ patient.dateNaissance }}
                </td>
                <td class="px-6 py-4 text-sm quaternary--text--color">
                  {{ patient.dernieresModifications }}
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      @click="handleRemovePatient(patient.id, patient.nom, patient.prenom)"
                      type="button"
                      class="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                      title="Retirer de ma liste"
                    >
                      <UIcon name="i-lucide-trash-2" class="h-4 w-4" />
                    </button>
                    <NuxtLink
                      :to="`/patient/${patient.id}`"
                      class="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
                      style="background-color: var(--primary-color)"
                    >
                      Afficher
                      <UIcon name="i-lucide-arrow-right" class="h-4 w-4" />
                    </NuxtLink>
                  </div>
                </td>
              </tr>

              <!-- Message si aucun résultat -->
              <tr v-if="filteredPatients.length === 0">
                <td colspan="7" class="px-6 py-12 text-center">
                  <p class="text-sm quaternary--text--color">
                    Aucun patient trouvé pour "{{ searchQuery }}"
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal d'ajout de patient -->
    <ModalAddPatient
      :is-open="isModalOpen"
      :is-loading="createPatientMutation.isPending.value || addPatientMutation.isPending.value || searchPatientMutation.isPending.value"
      :error-message="modalError"
      @close="closeModal"
      @submit="handleSubmitPatient"
    />

    <!-- Popup de confirmation pour les résultats de recherche -->
    <PatientSearchResult
      :is-open="showSearchResult"
      :patient="searchResultPatient"
      :is-loading="addPatientMutation.isPending.value"
      @confirm="handleConfirmSearchResult"
      @cancel="handleCancelSearchResult"
    />

    <!-- Modal de confirmation de suppression -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showDeleteConfirm"
          class="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
        >
          <!-- Overlay -->
          <div
            class="pointer-events-auto absolute inset-0 bg-black/30 backdrop-blur-sm"
            @click="cancelDeletePatient"
          ></div>

          <!-- Modal -->
          <div
            class="pointer-events-auto relative z-10 w-full max-w-md rounded-lg border-2 tertiary--background--color secondary--border--color shadow-xl bg-white"
            @click.stop
          >
            <!-- En-tête -->
            <div
              class="flex items-center justify-between border-b border-gray-200 px-6 py-4"
            >
              <h2
                class="text-xl font-semibold secondary--text--color font--title"
              >
                Confirmer la suppression
              </h2>
              <button
                @click="cancelDeletePatient"
                class="text-gray-400 hover:text-gray-600 transition-colors"
                type="button"
              >
                <UIcon name="i-lucide-x" class="h-6 w-6" />
              </button>
            </div>

            <!-- Contenu -->
            <div class="px-6 py-6">
              <p class="text-sm text-gray-600">
                Êtes-vous sûr de vouloir retirer
                <span class="font-semibold"
                  >{{ patientToDelete?.prenom }} {{ patientToDelete?.nom }}</span
                >
                de votre liste ?
              </p>
              <p class="mt-2 text-xs text-gray-500">
                Cette action ne supprime pas le patient du système, mais le retire uniquement de votre liste personnelle.
              </p>
            </div>

            <!-- Boutons -->
            <div class="border-t border-gray-200 px-6 py-4">
              <div class="flex gap-3">
                <button
                  @click="cancelDeletePatient"
                  type="button"
                  class="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  @click="confirmDeletePatient"
                  type="button"
                  :disabled="removePatientMutation.isPending.value"
                  class="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span v-if="removePatientMutation.isPending.value"
                    >Suppression...</span
                  >
                  <span v-else>Retirer de ma liste</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* Animation d'entrée/sortie du modal */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  opacity: 0;
  transform: scale(0.95);
}
</style>
