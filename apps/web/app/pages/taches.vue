<script setup lang="ts">
import type { Tache } from "~/types/tache";
import { useQuery } from "@tanstack/vue-query";

const { $authClient, $orpc } = useNuxtApp();

definePageMeta({
  middleware: ["auth"],
});

// Vérifier la session avant de faire la requête
const session = $authClient.useSession();

// Filtres
const filterEtat = ref<"TOUS" | "A_FAIRE" | "EN_COURS" | "TERMINEE" | "ANNULEE">("TOUS");
const filterType = ref<"TOUS" | Tache["typeDemarche"]>("TOUS");

// Récupération des tâches du professionnel connecté
const {
  data: taches,
  isLoading,
  isError,
} = useQuery({
  ...$orpc.listTachesByProfessionnel.queryOptions(),
  enabled: computed(() => {
    return !!session.value?.data && !session.value.isPending;
  }),
});

// Formater les tâches pour le composant TaskCard
const formattedTasks = computed(() => {
  if (!taches.value) return [];

  return taches.value
    .map((tache: Tache) => {
      const patientName = tache.patient?.informationIdentite
        ? `${tache.patient.informationIdentite.nomUsage} ${tache.patient.informationIdentite.prenom}`
        : "Patient inconnu";

      const date =
        tache.date instanceof Date
          ? tache.date.toLocaleDateString("fr-FR")
          : typeof tache.date === "string"
            ? new Date(tache.date).toLocaleDateString("fr-FR")
            : "";

      // Déterminer la couleur selon le type de démarche
      const accentColor =
        tache.typeDemarche === "ADMINISTRATIVE" ||
        tache.typeDemarche === "SOCIALE" ||
        tache.typeDemarche === "LOGEMENT"
          ? "peach"
          : "lavender";

      // Déterminer le label selon l'état
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
        patientName,
        date,
        accentColor,
        statusLabel,
        tache,
        etat: tache.etat,
        typeDemarche: tache.typeDemarche,
      };
    })
    .filter((task) => {
      // Filtrer par état
      if (filterEtat.value !== "TOUS" && task.etat !== filterEtat.value) {
        return false;
      }
      // Filtrer par type
      if (filterType.value !== "TOUS" && task.typeDemarche !== filterType.value) {
        return false;
      }
      return true;
    });
});

// Fonction pour obtenir le label du type de démarche
const getTypeDemarcheLabel = (type: Tache["typeDemarche"]): string => {
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

// Statistiques
const stats = computed(() => {
  if (!taches.value) {
    return {
      total: 0,
      aFaire: 0,
      enCours: 0,
      terminee: 0,
      annulee: 0,
    };
  }

  return {
    total: taches.value.length,
    aFaire: taches.value.filter((t) => t.etat === "A_FAIRE").length,
    enCours: taches.value.filter((t) => t.etat === "EN_COURS").length,
    terminee: taches.value.filter((t) => t.etat === "TERMINEE").length,
    annulee: taches.value.filter((t) => t.etat === "ANNULEE").length,
  };
});
</script>

<template>
  <div class="min-h-svh px-10 py-10 font--text">
    <div class="mx-auto max-w-6xl space-y-6">
      <!-- En-tête -->
      <header class="space-y-4">
        <h1 class="text-3xl font-bold secondary--text--color font--title">
          Mes tâches
        </h1>
        <p class="text-sm quaternary--text--color">
          Gérez toutes vos tâches et démarches pour vos patients
        </p>
      </header>

      <!-- Statistiques -->
      <section
        v-if="!isLoading && !isError && taches"
        class="grid grid-cols-2 md:grid-cols-5 gap-4"
      >
        <div
          class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        >
          <p class="text-xs quaternary--text--color mb-1">Total</p>
          <p class="text-2xl font-bold secondary--text--color">
            {{ stats.total }}
          </p>
        </div>
        <div
          class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        >
          <p class="text-xs quaternary--text--color mb-1">À faire</p>
          <p class="text-2xl font-bold text-orange-600">
            {{ stats.aFaire }}
          </p>
        </div>
        <div
          class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        >
          <p class="text-xs quaternary--text--color mb-1">En cours</p>
          <p class="text-2xl font-bold text-blue-600">
            {{ stats.enCours }}
          </p>
        </div>
        <div
          class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        >
          <p class="text-xs quaternary--text--color mb-1">Terminées</p>
          <p class="text-2xl font-bold text-green-600">
            {{ stats.terminee }}
          </p>
        </div>
        <div
          class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        >
          <p class="text-xs quaternary--text--color mb-1">Annulées</p>
          <p class="text-2xl font-bold text-gray-600">
            {{ stats.annulee }}
          </p>
        </div>
      </section>

      <!-- Filtres -->
      <section
        v-if="!isLoading && !isError && taches && taches.length > 0"
        class="flex flex-wrap gap-4 items-center"
      >
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium secondary--text--color">
            Filtrer par état :
          </label>
          <select
            v-model="filterEtat"
            class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm input-focus-primary"
          >
            <option value="TOUS">Tous</option>
            <option value="A_FAIRE">À faire</option>
            <option value="EN_COURS">En cours</option>
            <option value="TERMINEE">Terminées</option>
            <option value="ANNULEE">Annulées</option>
          </select>
        </div>

        <div class="flex items-center gap-2">
          <label class="text-sm font-medium secondary--text--color">
            Filtrer par type :
          </label>
          <select
            v-model="filterType"
            class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm input-focus-primary"
          >
            <option value="TOUS">Tous</option>
            <option value="ADMINISTRATIVE">Administrative</option>
            <option value="MEDICALE">Médicale</option>
            <option value="SOCIALE">Sociale</option>
            <option value="JURIDIQUE">Juridique</option>
            <option value="LOGEMENT">Logement</option>
            <option value="EMPLOI">Emploi</option>
            <option value="AUTRE">Autre</option>
          </select>
        </div>

        <div class="ml-auto text-sm quaternary--text--color">
          {{ formattedTasks.length }} tâche(s) affichée(s)
        </div>
      </section>

      <!-- État de chargement -->
      <section v-if="isLoading" class="space-y-4">
        <div class="text-center py-12">
          <UIcon
            name="i-lucide-loader-2"
            class="h-8 w-8 animate-spin mx-auto mb-4 quaternary--text--color"
          />
          <p class="text-sm quaternary--text--color">
            Chargement des tâches...
          </p>
        </div>
      </section>

      <!-- Erreur -->
      <section v-else-if="isError" class="space-y-4">
        <div class="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <UIcon name="i-lucide-alert-circle" class="h-8 w-8 mx-auto mb-4 text-red-500" />
          <p class="text-sm text-red-600 font-medium mb-2">
            Erreur lors du chargement des tâches
          </p>
          <p class="text-xs text-red-500">
            Veuillez réessayer ou contacter le support si le problème persiste.
          </p>
        </div>
      </section>

      <!-- Aucune tâche -->
      <section
        v-else-if="formattedTasks.length === 0"
        class="rounded-lg border border-gray-200 bg-white p-12 text-center"
      >
        <UIcon
          name="i-lucide-clipboard-list"
          class="h-12 w-12 mx-auto mb-4 quaternary--text--color"
        />
        <p class="text-sm font-medium secondary--text--color mb-1">
          Aucune tâche
        </p>
        <p class="text-xs quaternary--text--color">
          {{
            filterEtat !== "TOUS" || filterType !== "TOUS"
              ? "Aucune tâche ne correspond aux filtres sélectionnés."
              : "Vous n'avez aucune tâche pour le moment."
          }}
        </p>
      </section>

      <!-- Liste des tâches -->
      <section v-else class="space-y-4">
        <TaskCard
          v-for="task in formattedTasks"
          :key="task.id"
          v-bind="task"
        />
      </section>
    </div>
  </div>
</template>
