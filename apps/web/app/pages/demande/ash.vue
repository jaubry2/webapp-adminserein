<template>
  <div class="min-h-screen flex items-center justify-center bg-[#f5f7fa] px-4 py-10">
    <section class="w-full max-w-3xl space-y-6">
      <!-- Sélection du patient suivi -->
      <div
        class="rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm flex flex-col gap-3"
      >
        <h1 class="text-lg font-semibold secondary--text--color font--title">
          Patient concerné par la demande ASH
        </h1>

        <p class="text-xs quaternary--text--color" v-if="isProfessionnel">
          Sélectionnez le patient pour lequel vous préparez cette demande d’ASH,
          ou continuez sans patient pour garder une démarche générique.
        </p>
        <p class="text-xs quaternary--text--color" v-else-if="isParticulier">
          Cette demande sera associée à votre propre dossier patient.
        </p>

        <!-- Sélection de patient pour les professionnels -->
        <template v-if="isProfessionnel">
          <div v-if="!patientOptions.length" class="text-xs quaternary--text--color">
            Aucun patient disponible pour l’instant.
          </div>
          <div v-else class="flex flex-col gap-2">
            <select
              v-model="selectedPatientId"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm secondary--text--color input-focus-primary"
            >
              <option :value="null">Sans patient (démarche générique)</option>
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
            v-if="!particulierPatient"
            class="text-xs quaternary--text--color"
          >
            Chargement de vos informations patient...
          </div>
          <div
            v-else
            class="text-sm secondary--text--color"
          >
            <p class="font-medium">
              {{
                (particulierPatient as any).informationIdentite
                  ? `${(particulierPatient as any).informationIdentite.prenom} ${(particulierPatient as any).informationIdentite.nomUsage || (particulierPatient as any).informationIdentite.nomNaissance}`
                  : "Patient inconnu"
              }}
            </p>
          </div>
        </template>
      </div>

      <!-- Questionnaire ASH -->
      <form
        class="space-y-6 rounded-xl border border-gray-200 bg-white px-8 py-8 shadow-sm"
        @submit.prevent="openCcasDirectory"
      >
        <!-- Qui est concerné -->
        <div class="space-y-2">
          <label class="block text-sm font-medium secondary--text--color">
            Qui est concerné par la demande ?
          </label>
          <div class="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              class="flex-1 rounded-lg border px-4 py-2 text-sm transition-colors"
              :class="
                personneConcernee === 'moi'
                  ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/10 secondary--text--color'
                  : 'border-gray-300 bg-white quaternary--text--color hover:bg-gray-50'
              "
              @click="personneConcernee = 'moi'"
            >
              Moi-même
            </button>
            <button
              type="button"
              class="flex-1 rounded-lg border px-4 py-2 text-sm transition-colors"
              :class="
                personneConcernee === 'proche'
                  ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/10 secondary--text--color'
                  : 'border-gray-300 bg-white quaternary--text--color hover:bg-gray-50'
              "
              @click="personneConcernee = 'proche'"
            >
              Un proche (parent, conjoint, etc.)
            </button>
          </div>
        </div>

        <!-- Localisation principale -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1">
            <label class="block text-sm font-medium secondary--text--color">
              Code postal
              <span class="text-red-500">*</span>
            </label>
            <input
              v-model="codePostal"
              type="text"
              inputmode="numeric"
              maxlength="5"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm secondary--text--color input-focus-primary"
              placeholder="Ex : 72000"
            />
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium secondary--text--color">
              Commune
            </label>
            <input
              v-model="commune"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm secondary--text--color input-focus-primary"
              placeholder="Ex : Le Mans"
            />
          </div>
        </div>

        <!-- Type de lieu -->
        <div class="space-y-2">
          <label class="block text-sm font-medium secondary--text--color">
            Où vit actuellement la personne concernée ?
          </label>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              class="rounded-lg border px-4 py-2 text-sm text-left transition-colors"
              :class="
                lieu === 'domicile'
                  ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/10 secondary--text--color'
                  : 'border-gray-300 bg-white quaternary--text--color hover:bg-gray-50'
              "
              @click="lieu = 'domicile'"
            >
              À domicile
            </button>
            <button
              type="button"
              class="rounded-lg border px-4 py-2 text-sm text-left transition-colors"
              :class="
                lieu === 'ehpad'
                  ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/10 secondary--text--color'
                  : 'border-gray-300 bg-white quaternary--text--color hover:bg-gray-50'
              "
              @click="lieu = 'ehpad'"
            >
              En EHPAD / résidence médicalisée
            </button>
            <button
              type="button"
              class="rounded-lg border px-4 py-2 text-sm text-left transition-colors"
              :class="
                lieu === 'residence'
                  ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/10 secondary--text--color'
                  : 'border-gray-300 bg-white quaternary--text--color hover:bg-gray-50'
              "
              @click="lieu = 'residence'"
            >
              Résidence autonomie / résidence services
            </button>
            <button
              type="button"
              class="rounded-lg border px-4 py-2 text-sm text-left transition-colors"
              :class="
                lieu === 'autre'
                  ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/10 secondary--text--color'
                  : 'border-gray-300 bg-white quaternary--text--color hover:bg-gray-50'
              "
              @click="lieu = 'autre'"
            >
              Autre situation
            </button>
          </div>
        </div>

        <!-- Info + boutons -->
        <div class="space-y-3">
          <p class="text-xs quaternary--text--color">
            Les réponses ci-dessus ne sont pas envoyées automatiquement : elles vous aident à
            préparer les informations à donner au CCAS ou au département.
          </p>
          <div class="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-2 text-sm font-medium secondary--text--color shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
              :disabled="!codePostalValid || isSavingDemande"
              @click="saveDemandeAsh"
            >
              <UIcon name="i-lucide-save" class="h-4 w-4" />
              <span v-if="isSavingDemande">Enregistrement...</span>
              <span v-else>Enregistrer la demande ASH</span>
            </button>
            <button
              type="submit"
              class="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-[#a7c7e7] px-6 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:opacity-90 disabled:opacity-50"
              :disabled="!codePostalValid"
            >
              <span>
                Trouver mon CCAS
                <span v-if="departementLabel">dans le {{ departementLabel }}</span>
              </span>
              <UIcon name="i-lucide-external-link" class="h-4 w-4" />
            </button>
          </div>
        </div>
      </form>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { useMutation, useQuery } from "@tanstack/vue-query";

definePageMeta({
  middleware: ["auth"],
});

const route = useRoute();
const router = useRouter();
const { $orpc } = useNuxtApp();
const toast = useToast();

const personneConcernee = ref<"moi" | "proche">("moi");
const codePostal = ref("");
const commune = ref("");
const lieu = ref<"domicile" | "ehpad" | "residence" | "autre">("domicile");

const codePostalValid = computed(() => codePostal.value.trim().length >= 4);

const departementCode = computed(() => codePostal.value.trim().slice(0, 2));

const departementLabel = computed(() => {
  if (departementCode.value === "72") return "Sarthe";
  if (departementCode.value === "75") return "Paris";
  if (departementCode.value === "69") return "Rhône";
  if (departementCode.value === "13") return "Bouches-du-Rhône";
  return "";
});

// --- Type d'utilisateur & patient éventuel ---
const { data: userTypeData } = useQuery({
  ...$orpc.getUserType.queryOptions(),
});

const userType = computed(() => userTypeData.value?.type || null);
const isProfessionnel = computed(() => userType.value === "PROFESSIONNEL");
const isParticulier = computed(() => userType.value === "PARTICULIER");

const selectedPatientId = ref<string | null>(
  typeof route.query.patientId === "string"
    ? (route.query.patientId as string)
    : null,
);

const {
  data: apiPatients,
} = useQuery({
  ...$orpc.listPatients.queryOptions(),
  enabled: computed(() => isProfessionnel.value),
});

type PatientOption = { id: string; label: string };

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
} = useQuery({
  ...$orpc.getPatientByIdForParticulier.queryOptions(),
  enabled: computed(() => isParticulier.value),
});

const selectedPatientForPro = computed<any | null>(() => {
  if (!isProfessionnel.value || !apiPatients.value || !selectedPatientId.value) {
    return null;
  }
  return (
    apiPatients.value.find((p: any) => p.id === selectedPatientId.value) ?? null
  );
});

const currentPatientId = computed<string | null>(() => {
  if (isProfessionnel.value) return selectedPatientId.value;
  if (isParticulier.value) return (particulierPatient.value as any)?.id ?? null;
  return null;
});

// Pré-remplir code postal / commune à partir du patient
watch(
  () => selectedPatientForPro.value,
  (p) => {
    if (!p) return;
    const coord = (p as any).informationCoordonnee ?? {};
    if (coord.codePostal) {
      codePostal.value = String(coord.codePostal);
    }
    if (coord.ville) {
      commune.value = String(coord.ville);
    }
  },
);

watch(
  () => particulierPatient.value,
  (p) => {
    if (!p) return;
    const coord = (p as any).informationCoordonnee ?? {};
    if (coord.codePostal) {
      codePostal.value = String(coord.codePostal);
    }
    if (coord.ville) {
      commune.value = String(coord.ville);
    }
  },
  { immediate: true },
);

// --- Enregistrement de la demande ASH ---
const isSavingDemande = ref(false);

const createDemandeMutation = useMutation({
  ...$orpc.createDemande.mutationOptions(),
  onSuccess: () => {
    toast.add({
      title: "Demande ASH enregistrée",
      description: "La demande a été sauvegardée dans vos démarches.",
    });
  },
  onError: (error: any) => {
    toast.add({
      title: "Erreur",
      description:
        error?.message || "Impossible d'enregistrer la demande d'ASH.",
      color: "error",
    });
  },
  onSettled: () => {
    isSavingDemande.value = false;
  },
});

function buildCcasUrl() {
  let url = "https://www.pour-les-personnes-agees.gouv.fr/annuaire-ccas";

  switch (departementCode.value) {
    case "72":
      url += "?departement=sarthe-72#container-result-query";
      break;
    case "75":
      url += "?departement=paris-75#container-result-query";
      break;
    case "69":
      url += "?departement=rhone-69#container-result-query";
      break;
    case "13":
      url += "?departement=bouches-du-rhone-13#container-result-query";
      break;
    default:
      break;
  }

  return url;
}

function openCcasDirectory() {
  if (!codePostalValid.value) return;

  const url = buildCcasUrl();

  if (process.client) {
    window.open(url, "_blank");
  }
}

async function saveDemandeAsh() {
  if (!codePostalValid.value) {
    toast.add({
      title: "Code postal manquant",
      description: "Renseignez au moins le code postal pour enregistrer la demande.",
      color: "error",
    });
    return;
  }

  isSavingDemande.value = true;

  const url = buildCcasUrl();
  const details = url ? `lien : ${url}` : "";

  await createDemandeMutation.mutateAsync({
    typeDemande: "ASH",
    patientId: currentPatientId.value ?? undefined,
    details,
  });

  router.push("/mes-demandes");
}
</script>

<style></style>

