<script setup lang="ts">
const route = useRoute();
const { getPatientById, calculateAge, getHistoriqueByPatientId } = await import(
  "~/utils/patients"
);

const patientId = computed(() => Number(route.params.id));
const patient = computed(() => getPatientById(patientId.value));

if (!patient.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Patient non trouvé",
  });
}

const age = computed(() => {
  if (patient.value?.dateNaissance) {
    return calculateAge(patient.value.dateNaissance);
  }
  return null;
});

const activeTab = ref("information");
const identiteExpanded = ref(true);
const coordonneesExpanded = ref(true);

// Récupération de l'historique du patient
const historique = computed(() => getHistoriqueByPatientId(patientId.value));

const tabs = [
  { id: "information", label: "Information", icon: "i-lucide-info" },
  { id: "document", label: "Document", icon: "i-lucide-file-text" },
  { id: "historique", label: "Historique", icon: "i-lucide-clock" },
  { id: "tache", label: "Tâche", icon: "i-lucide-check-square" },
];
</script>

<template>
  <div v-if="patient" class="h-screen bg-white font--text">
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
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium secondary--text--color transition-colors hover:bg-gray-50"
            >
              <UIcon name="i-lucide-pencil" class="h-4 w-4" />
              Modifier
            </button>
          </div>

          <!-- Contenu de l'onglet -->
          <div class="flex-1 overflow-y-auto scrollbar-hide">
            <!-- Contenu de l'onglet Information -->
            <div v-if="activeTab === 'information'" class="space-y-4 pb-6">
              <!-- Section Identité -->
              <OngletInformationIdentite :patient="patient" />
              <!-- Section Coordonnées -->
              <OngletInformationCoordonnee :patient="patient" />
            </div>

            <!-- Contenu de l'onglet Historique -->
            <div v-else-if="activeTab === 'historique'" class="pb-6">
              <OngletHistoriqueTimeline :evenements="historique" />
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
  </div>
</template>
