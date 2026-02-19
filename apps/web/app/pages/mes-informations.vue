<script setup lang="ts">
import type { Patient } from "~/types/patient";
import type { Tache } from "~/types/tache";
import type { Document } from "~/types/document";
import { useQuery } from "@tanstack/vue-query";

definePageMeta({
  middleware: ["auth"],
});

const { $authClient, $orpc } = useNuxtApp();
const session = $authClient.useSession();

// Récupérer le type d'utilisateur
const { data: userTypeData } = useQuery({
  ...$orpc.getUserType.queryOptions(),
  enabled: computed(() => !!session.value?.data && !session.value.isPending),
});

const isParticulier = computed(() => userTypeData.value?.type === "PARTICULIER");

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
} = useQuery({
  ...$orpc.getPatientByIdForParticulier.queryOptions(),
  enabled: computed(() => {
    return (
      !!session.value?.data &&
      !session.value.isPending &&
      isParticulier.value
    );
  }),
});

// Récupération des tâches
const { data: tachesData } = useQuery({
  ...$orpc.listTachesByParticulier.queryOptions(),
  enabled: computed(() => {
    return (
      !!session.value?.data &&
      !session.value.isPending &&
      isParticulier.value
    );
  }),
}) as { data: Ref<Tache[] | undefined> };

// Récupération des documents
const patientIdForDocs = computed(() => apiPatient.value?.id || "");
const { data: documentsData } = useQuery({
  ...$orpc.listDocumentsByPatient.queryOptions({
    input: {
      patientId: patientIdForDocs.value,
    },
  }),
  enabled: computed(() => {
    return (
      !!session.value?.data &&
      !session.value.isPending &&
      isParticulier.value &&
      !!patientIdForDocs.value
    );
  }),
}) as { data: Ref<Document[] | undefined> };

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
];
</script>

<template>
  <div class="min-h-svh px-10 py-10 font--text">
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <UIcon name="i-lucide-loader-2" class="animate-spin text-4xl text-primary" />
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
      <div class="flex gap-2 border-b border-gray-200">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors"
          :class="
            activeTab === tab.id
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-500 hover:text-gray-700'
          "
        >
          <UIcon :name="tab.icon" class="h-4 w-4" />
          {{ tab.label }}
        </button>
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
          <OngletInformationCoordonnee
            :patient="patient"
            :is-editing="false"
            @save="() => {}"
            @cancel="() => {}"
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
          <h2 class="text-lg font-semibold secondary--text--color">Mes tâches</h2>
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
              :accent-color="
                tache.etat === 'TERMINEE'
                  ? 'green'
                  : tache.etat === 'EN_COURS'
                    ? 'blue'
                    : tache.etat === 'ANNULEE'
                      ? 'red'
                      : 'peach'
              "
              :status-label="tache.etat"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
