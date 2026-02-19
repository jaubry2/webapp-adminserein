<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import type { Tache } from "~/types/tache";
import type { Particulier } from "~/types/particulier";

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

const userType = computed(() => userTypeData.value?.type || null);
const isProfessionnel = computed(() => userType.value === "PROFESSIONNEL");
const isParticulier = computed(() => userType.value === "PARTICULIER");

// Rediriger les professionnels vers /taches
watchEffect(() => {
  if (isProfessionnel.value && !session.value.isPending) {
    navigateTo("/taches", { replace: true });
  }
});

// Récupérer le particulier connecté et ses tâches
const { data: currentParticulier } = useQuery({
  ...$orpc.getCurrentParticulier.queryOptions(),
  enabled: computed(
    () =>
      !!session.value?.data &&
      !session.value.isPending &&
      isParticulier.value
  ),
}) as { data: Ref<Particulier | undefined> };

const { data: tachesData, isLoading: isLoadingTaches } = useQuery({
  ...$orpc.listTachesByParticulier.queryOptions(),
  enabled: computed(
    () =>
      !!session.value?.data &&
      !session.value.isPending &&
      isParticulier.value
  ),
}) as { data: Ref<Tache[] | undefined>; isLoading: Ref<boolean> };

const patientInfo = computed(() => {
  return currentParticulier.value?.patient?.informationIdentite;
});

const displayName = computed(() => {
  if (patientInfo.value) {
    return `${patientInfo.value.prenom} ${patientInfo.value.nomUsage}`;
  }
  return session.value?.data?.user?.name || "utilisateur";
});
</script>

<template>
  <div v-if="isParticulier" class="min-h-svh px-10 py-10 font--text">
    <div class="mx-auto max-w-5xl space-y-10">
      <header class="space-y-2">
        <p class="text-sm text-slate-500">
          Bonjour
          <span class="font-medium text-slate-700">{{ displayName }}</span>
        </p>
        <div v-if="patientInfo" class="mt-2 text-xs text-slate-400">
          <p>Numéro de dossier : {{ currentParticulier?.patient?.numeroDossier }}</p>
        </div>
      </header>

      <section>
        <div
          class="flex h-56 items-center justify-center rounded-3xl bg-[#d7d9dd]"
        >
          <p class="text-2xl font-semibold text-slate-800">
            Mes informations personnelles
          </p>
        </div>
      </section>

      <section class="space-y-4">
        <h2 class="text-lg font-semibold text-slate-800">Mes tâches</h2>
        <div v-if="isLoadingTaches" class="text-center py-8">
          <p class="text-sm text-slate-500">Chargement des tâches...</p>
        </div>
        <div
          v-else-if="!tachesData || tachesData.length === 0"
          class="text-center py-8"
        >
          <p class="text-sm text-slate-500">Aucune tâche pour le moment</p>
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
      </section>
    </div>
  </div>
  <div v-else class="min-h-svh px-10 py-10 font--text">
    <div class="mx-auto max-w-5xl space-y-10">
      <div class="text-center py-12">
        <p class="text-sm text-slate-500">Chargement...</p>
      </div>
    </div>
  </div>
</template>
