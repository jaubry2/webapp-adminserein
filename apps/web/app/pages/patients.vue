<script setup lang="ts">
const { $authClient } = useNuxtApp();

const session = $authClient.useSession();

// Import des données des patients depuis le fichier utils
const { patientsData } = await import("~/utils/patients");
const patients = patientsData;

const searchQuery = ref("");

// Filtrer les patients selon la recherche
const filteredPatients = computed(() => {
  if (!searchQuery.value) {
    return patients;
  }
  const query = searchQuery.value.toLowerCase();
  return patients.filter(
    (patient) =>
      patient.nom.toLowerCase().includes(query) ||
      patient.prenom.toLowerCase().includes(query) ||
      patient.dossierNumber.includes(query)
  );
});

const selectedPatients = ref<number[]>([]);

const togglePatientSelection = (patientId: number) => {
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

const handleSubmitPatient = (data: any) => {
  // TODO: Implémenter la logique d'ajout du patient
  console.log("Données du nouveau patient:", data);
  // Ici vous pourrez appeler une API ou mettre à jour le store
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
              <tr
                v-for="patient in filteredPatients"
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
      @close="closeModal"
      @submit="handleSubmitPatient"
    />
  </div>
</template>
