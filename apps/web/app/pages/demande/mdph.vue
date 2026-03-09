<template>
  <div class="p-8 flex flex-col items-center gap-8">
    <!-- Sélection du patient suivi -->
    <section class="w-full max-w-3xl mb-4">
      <div
        class="rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm flex flex-col gap-3"
      >
        <h1 class="text-lg font-semibold secondary--text--color font--title">
          Patient concerné par la demande MDPH
        </h1>

        <p class="text-xs quaternary--text--color" v-if="isProfessionnel">
          Sélectionnez le patient pour lequel vous remplissez cette demande
          MDPH, ou continuez sans patient pour remplir le formulaire
          manuellement.
        </p>
        <p class="text-xs quaternary--text--color" v-else-if="isParticulier">
          Cette demande sera remplie pour vous-même. Vos informations seront
          utilisées pour associer le dossier MDPH.
        </p>

        <!-- Sélection de patient pour les professionnels -->
        <template v-if="isProfessionnel">
          <div v-if="isLoadingPatients" class="text-xs quaternary--text--color">
            Chargement de vos patients...
          </div>
          <div v-else-if="isErrorPatients" class="text-xs text-red-500">
            Impossible de charger la liste des patients.
          </div>
          <div v-else class="flex flex-col gap-2">
            <select
              v-model="selectedPatientId"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm secondary--text--color input-focus-primary"
            >
              <option :value="null">Sans patient (saisie manuelle)</option>
              <option
                v-for="patient in patientOptions"
                :key="patient.id"
                :value="patient.id"
              >
                {{ patient.label }}
              </option>
            </select>
          </div>
        </template>

        <!-- Affichage du patient pour les particuliers -->
        <template v-else-if="isParticulier">
          <div
            v-if="isLoadingParticulierPatient"
            class="text-xs quaternary--text--color"
          >
            Chargement de vos informations patient...
          </div>
          <div
            v-else-if="isErrorParticulierPatient"
            class="text-xs text-red-500"
          >
            Impossible de charger vos informations patient.
          </div>
          <div
            v-else-if="selectedPatient"
            class="text-sm secondary--text--color"
          >
            <p class="font-medium">
              {{
                selectedPatient.informationIdentite
                  ? `${selectedPatient.informationIdentite.prenom} ${selectedPatient.informationIdentite.nomUsage || selectedPatient.informationIdentite.nomNaissance}`
                  : "Patient inconnu"
              }}
            </p>
          </div>
        </template>
      </div>
    </section>

    <!-- Actions MDPH -->
    <section class="w-full max-w-3xl flex flex-col items-center gap-4">
      <button
        class="rounded-full border border-gray-300 bg-[#a7c7e7] px-6 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:opacity-90"
        @click="showPdfPopup = true"
      >
        Remplir le formulaire MDPH
      </button>
    </section>

    <!-- Popup PDF -->
    <div
      v-if="showPdfPopup"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      @click.self="showPdfPopup = false"
    >
      <div
        class="relative w-full max-w-5xl h-[80vh] rounded-xl bg-white shadow-xl border border-gray-200 flex flex-col"
      >
        <header
          class="flex items-center justify-between px-4 py-2 border-b border-gray-200"
        >
          <h2 class="text-sm font-semibold secondary--text--color font--title">
            Formulaire MDPH remplissable
          </h2>
          <button
            type="button"
            class="text-xs quaternary--text--color hover:text-gray-800"
            @click="showPdfPopup = false"
          >
            Fermer
          </button>
        </header>

        <div class="flex-1 flex flex-col">
          <div class="px-4 py-2 border-b border-gray-100">
            <p class="text-[11px] quaternary--text--color">
              Remplissez le formulaire directement dans le PDF ci-dessous, puis utilisez
              le bouton de téléchargement du lecteur PDF pour récupérer le document complété.
              Ensuite, cliquez sur <span class="font-semibold">"Enregistrer la demande"</span>
              pour créer la demande MDPH et ajoutez le PDF dans les documents de la demande.
            </p>
          </div>
          <div class="flex-1">
            <object
              data="/pdf/mdph_remplissable.pdf"
              type="application/pdf"
              class="w-full h-full"
            >
              <p class="p-4 text-xs quaternary--text--color">
                Votre navigateur ne permet pas d’afficher le PDF. Vous pouvez
                le télécharger
                <a
                  href="/pdf/mdph_remplissable.pdf"
                  target="_blank"
                  class="text-blue-600 underline"
                >
                  en cliquant ici
                </a>.
              </p>
            </object>
          </div>
        </div>

        <footer
          class="flex items-center justify-end gap-3 px-4 py-3 border-t border-gray-200"
        >
          <button
            type="button"
            class="rounded-full border border-gray-300 bg-white px-4 py-1.5 text-xs font-medium quaternary--text--color hover:bg-gray-50"
            @click="showPdfPopup = false"
          >
            Annuler
          </button>
          <button
            type="button"
            class="rounded-full border border-gray-300 bg-[#a7c7e7] px-4 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:opacity-90 disabled:opacity-50"
            :disabled="isSavingDemande"
            @click="handleSaveDemande"
          >
            <span v-if="isSavingDemande">Enregistrement...</span>
            <span v-else>Enregistrer la demande</span>
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";
import { useQuery, useMutation } from "@tanstack/vue-query";

definePageMeta({
  middleware: ["auth"],
});

const route = useRoute();
const router = useRouter();
const { $orpc } = useNuxtApp();

const { data: userTypeData } = useQuery({
  ...$orpc.getUserType.queryOptions(),
});

const userType = computed(() => userTypeData.value?.type || null);
const isProfessionnel = computed(() => userType.value === "PROFESSIONNEL");
const isParticulier = computed(() => userType.value === "PARTICULIER");

const editDemandeId = computed<string | null>(() => {
  if (typeof route.query.demandeId === "string") {
    return route.query.demandeId as string;
  }
  if (Array.isArray(route.query.demandeId) && route.query.demandeId.length > 0) {
    return route.query.demandeId[0] as string;
  }
  return null;
});

const selectedPatientId = ref<string | null>(
  typeof route.query.patientId === "string"
    ? (route.query.patientId as string)
    : null,
);

type PatientOption = {
  id: string;
  label: string;
};

const {
  data: apiPatients,
  isLoading: isLoadingPatients,
  isError: isErrorPatients,
} = useQuery({
  ...$orpc.listPatients.queryOptions(),
  enabled: computed(() => isProfessionnel.value),
});

const patientOptions = computed<PatientOption[]>(() => {
  if (!apiPatients.value) return [];
  return apiPatients.value.map((p: any) => ({
    id: p.id,
    label: p.informationIdentite
      ? `${p.informationIdentite.prenom} ${p.informationIdentite.nomUsage || p.informationIdentite.nomNaissance}`
      : "Patient inconnu",
  }));
});

const {
  data: particulierPatient,
  isLoading: isLoadingParticulierPatient,
  isError: isErrorParticulierPatient,
} = useQuery({
  ...$orpc.getParticulierPatient.queryOptions(),
  enabled: computed(() => isParticulier.value),
});

const selectedPatient = computed(() => {
  if (isProfessionnel.value) {
    const id = selectedPatientId.value;
    return apiPatients.value?.find((p: any) => p.id === id) ?? null;
  }
  if (isParticulier.value) {
    return particulierPatient.value ?? null;
  }
  return null;
});

const showPdfPopup = ref(false);

const isSavingDemande = ref(false);

const createDemandeMutation = useMutation({
  ...$orpc.createDemande.mutationOptions(),
  onSettled: () => {
    isSavingDemande.value = false;
  },
});

const updateDemandeMutation = useMutation({
  ...$orpc.updateDemande.mutationOptions(),
  onSettled: () => {
    isSavingDemande.value = false;
  },
});

watch(
  editDemandeId,
  (val) => {
    // Si on est en mode édition (demande MDPH existante), on ouvre le PDF
    if (val) {
      showPdfPopup.value = true;
    }
  },
  { immediate: true },
);

async function handleSaveDemande() {
  isSavingDemande.value = true;

  if (editDemandeId.value) {
    // Pour l'instant, on ne modifie aucune donnée côté backend pour MDPH :
    // on considère simplement que l'utilisateur a mis à jour le PDF en local.
    // Donc pas d'appel à updateDemande pour éviter les erreurs serveur inutiles.
  } else {
    // Création d'une nouvelle demande MDPH
    await createDemandeMutation.mutateAsync({
      typeDemande: "MDPH",
      patientId: selectedPatientId.value ?? undefined,
    });
  }

  showPdfPopup.value = false;
  router.push("/mes-demandes");
}
</script>

