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

    <!-- Formulaire MDPH (identité / type de demande) -->
    <section class="w-full max-w-3xl">
      <FormMDPHIntro
        :mdph_fields="mdphFields"
        @updateMdphFields="handleUpdateMdphFields"
      />
    </section>

    <!-- Bouton d'enregistrement de la demande -->
    <section class="w-full max-w-3xl flex flex-col items-center gap-4">
      <button
        class="rounded-full border border-gray-300 bg-[#a7c7e7] px-6 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:opacity-90 disabled:opacity-50"
        :disabled="isSavingDemande"
        @click="handleSaveDemande"
      >
        <span v-if="isSavingDemande">Enregistrement...</span>
        <span v-else-if="editDemandeId">Mettre à jour la demande</span>
        <span v-else>Enregistrer la demande</span>
      </button>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { useQuery, useMutation } from "@tanstack/vue-query";
import FormMDPHIdentite from "~/components/Form/MDPH/Identite.vue";
import { mdph_fields } from "~/utils/demandes/mdph_fields";
import type { infoFormulaire } from "~/types";

definePageMeta({
  middleware: ["auth"],
});

const route = useRoute();
const router = useRouter();
const { $orpc } = useNuxtApp();
const toast = useToast();

// --- Type d'utilisateur ---
const { data: userTypeData } = useQuery({
  ...$orpc.getUserType.queryOptions(),
});

const userType = computed(() => userTypeData.value?.type || null);
const isProfessionnel = computed(() => userType.value === "PROFESSIONNEL");
const isParticulier = computed(() => userType.value === "PARTICULIER");

// --- Mode édition : id de la demande MDPH si on arrive avec ?demandeId= ---
const editDemandeId = ref<string | null>(
  typeof route.query.demandeId === "string"
    ? (route.query.demandeId as string)
    : null,
);

// --- Patient sélectionné ---
type PatientOption = { id: string; label: string };

const selectedPatientId = ref<string | null>(
  typeof route.query.patientId === "string"
    ? (route.query.patientId as string)
    : null,
);

const {
  data: apiPatients,
  isLoading: isLoadingPatients,
  isError: isErrorPatients,
} = useQuery({
  ...$orpc.listPatients.queryOptions(),
  enabled: computed(() => isProfessionnel.value),
});

const patientOptions = computed<PatientOption[]>(() => {
  if (!isProfessionnel.value || !apiPatients.value) return [];

  return apiPatients.value.map((p: any) => {
    const info = p.informationIdentite;
    const nom = info?.nomUsage ?? info?.nomNaissance ?? "";
    const prenom = info?.prenom ?? "";
    const dossier = p.numeroDossier ? ` (${p.numeroDossier})` : "";

    return {
      id: p.id as string,
      label: `${nom} ${prenom}${dossier}`.trim(),
    };
  });
});

const {
  data: particulierPatient,
  isLoading: isLoadingParticulierPatient,
  isError: isErrorParticulierPatient,
} = useQuery({
  ...$orpc.getPatientByIdForParticulier.queryOptions(),
  enabled: computed(() => isParticulier.value),
});

const selectedPatient = computed<any | null>(() => {
  if (isParticulier.value) {
    return particulierPatient.value ?? null;
  }

  if (!apiPatients.value || !selectedPatientId.value) return null;
  return (
    apiPatients.value.find((p: any) => p.id === selectedPatientId.value) ?? null
  );
});

// --- État du formulaire MDPH (comme APA) ---
const mdphFields = ref<infoFormulaire>({ ...mdph_fields });

// --- Chargement d'une demande existante (édition) ---
const { data: existingDemande } = useQuery({
  ...$orpc.getDemandeById.queryOptions({
    input: {
      demandeId: editDemandeId.value as string,
    },
  }),
  enabled: computed(() => !!editDemandeId.value),
});

watch(
  () => existingDemande.value,
  (d) => {
    if (!d) return;
    if (d.donneesFormulaire) {
      mdphFields.value = d.donneesFormulaire as infoFormulaire;
    }
    if (d.patientId) {
      selectedPatientId.value = d.patientId;
    }
  },
);

// --- Sauvegarde de la demande MDPH ---
const isSavingDemande = ref(false);

const createDemandeMutation = useMutation({
  ...$orpc.createDemande.mutationOptions(),
  onSuccess: () => {
    toast.add({
      title: "Demande MDPH enregistrée",
      description: "La demande a été sauvegardée avec succès.",
    });
  },
  onError: (error: any) => {
    toast.add({
      title: "Erreur",
      description:
        error?.message || "Impossible d'enregistrer la demande MDPH.",
      color: "error",
    });
  },
  onSettled: () => {
    isSavingDemande.value = false;
  },
});

const updateDemandeMutation = useMutation({
  ...$orpc.updateDemande.mutationOptions(),
  onSuccess: () => {
    toast.add({
      title: "Demande MDPH mise à jour",
      description: "Les modifications ont été sauvegardées.",
    });
  },
  onError: (error: any) => {
    toast.add({
      title: "Erreur",
      description:
        error?.message || "Impossible de mettre à jour la demande MDPH.",
      color: "error",
    });
  },
  onSettled: () => {
    isSavingDemande.value = false;
  },
});

function handleUpdateMdphFields(updated: infoFormulaire) {
  mdphFields.value = { ...updated };
}

async function handleSaveDemande() {
  isSavingDemande.value = true;

  if (editDemandeId.value) {
    await updateDemandeMutation.mutateAsync({
      demandeId: editDemandeId.value,
      donneesFormulaire: mdphFields.value,
    });
  } else {
    await createDemandeMutation.mutateAsync({
      typeDemande: "MDPH",
      patientId: selectedPatientId.value ?? undefined,
      donneesFormulaire: mdphFields.value,
    });
  }

  router.push("/mes-demandes");
}
</script>
