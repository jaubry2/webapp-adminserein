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
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => n > 0);

  const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
  const nextNumber = maxNumber + 1;
  return `DOSSIER-${String(nextNumber).padStart(4, "0")}`;
};

const handleSubmitPatient = async (data: any) => {
  try {
    // Si l'utilisateur connaît le numéro de dossier, utiliser celui-ci
    let numeroDossier = data.dossierNumber;

    // Si l'utilisateur ne connaît pas le numéro de dossier
    if (!data.connaitDossierNumber) {
      // Si le patient a un dossier mais on ne connaît pas le numéro, générer un nouveau
      if (data.patientADossier === "non" || data.patientADossier === "je-sais-pas") {
        numeroDossier = await generateDossierNumber();
      } else if (data.patientADossier === "oui" && data.dossierNumber) {
        numeroDossier = data.dossierNumber;
      } else {
        numeroDossier = await generateDossierNumber();
      }
    }

    if (!numeroDossier) {
      toast.add({
        title: "Erreur",
        description: "Le numéro de dossier est requis",
        color: "error",
      });
      return;
    }

    // Convertir la date de naissance au format ISO si nécessaire
    let dateNaissanceISO = data.dateNaissance;
    if (dateNaissanceISO && dateNaissanceISO.includes("/")) {
      // Format JJ/MM/AAAA -> AAAA-MM-JJ
      const [day, month, year] = dateNaissanceISO.split("/");
      dateNaissanceISO = `${year}-${month}-${day}`;
    }

    // Préparer les données pour l'API
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
    };

    // Créer le patient
    await createPatientMutation.mutateAsync(patientData);
  } catch (error: any) {
    console.error("Erreur lors de la création du patient:", error);
  }
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
                  <NuxtLink
                    :to="`/patient/${patient.id}`"
                    class="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
                    style="background-color: var(--primary-color)"
                  >
                    Afficher
                    <UIcon name="i-lucide-arrow-right" class="h-4 w-4" />
                  </NuxtLink>
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
      :is-loading="createPatientMutation.isPending.value"
      @close="closeModal"
      @submit="handleSubmitPatient"
    />
  </div>
</template>
