<script setup lang="ts">
import type { Tache } from "~/types/tache";
import { useQuery } from "@tanstack/vue-query";

const { $authClient, $orpc } = useNuxtApp();

definePageMeta({
  middleware: ["auth"],
});

// Vérifier la session avant de faire la requête
const session = $authClient.useSession();

// Récupération des tâches du professionnel connecté
// Ne faire la requête que si la session est chargée et valide
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
type TaskAccentColor =
  | "peach"
  | "lavender"
  | "emerald"
  | "sky"
  | "amber"
  | "violet"
  | "teal"
  | "indigo"
  | "slate";

const formattedTasks = computed(() => {
  if (!taches.value) return [];

  return taches.value.map((tache: Tache) => {
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
    const accentColor = getAccentColorByType(tache.typeDemarche);

    // Déterminer le label selon l'état
    const statusLabel =
      tache.etat === "TERMINEE"
        ? "Terminée"
        : tache.etat === "EN_COURS"
          ? "En cours"
          : tache.etat === "ANNULEE"
            ? "Annulée"
            : tache.etat === "A_FAIRE"
              ? "À faire"
              : undefined;

    return {
      id: tache.id,
      label: `Démarche - ${getTypeDemarcheLabel(tache.typeDemarche)}`,
      patientName,
      date,
      accentColor,
      statusLabel,
      tache,
    };
  });
});

// Fonction pour obtenir la couleur d'accent selon le type de démarche
const getAccentColorByType = (
  type: Tache["typeDemarche"],
): TaskAccentColor => {
  switch (type) {
    case "ADMINISTRATIVE":
      return "amber";
    case "MEDICALE":
      return "emerald";
    case "SOCIALE":
      return "sky";
    case "JURIDIQUE":
      return "violet";
    case "LOGEMENT":
      return "teal";
    case "EMPLOI":
      return "indigo";
    case "AUTRE":
    default:
      return "slate";
  }
};

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
</script>

<template>
  <div class="min-h-svh px-10 py-10 font--text">
    <div class="mx-auto max-w-5xl space-y-10">
      <section>
        <div
          class="flex h-56 items-center justify-center rounded-3xl tertiary--background--color"
        >
          <p class="text-2xl font-semibold secondary--text--color">
            Nouveautés sur application
          </p>
        </div>
      </section>

      <section v-if="isLoading" class="space-y-4">
        <div class="text-center py-8">
          <p class="text-sm quaternary--text--color">
            Chargement des tâches...
          </p>
        </div>
      </section>

      <section v-else-if="isError" class="space-y-4">
        <div class="text-center py-8">
          <p class="text-sm text-red-500">
            Erreur lors du chargement des tâches.
          </p>
        </div>
      </section>

      <section v-else-if="formattedTasks.length === 0" class="space-y-4">
        <div class="text-center py-8">
          <p class="text-sm quaternary--text--color">
            Aucune tâche à afficher.
          </p>
        </div>
      </section>

      <section v-else class="space-y-4">
        <TaskCard v-for="task in formattedTasks" :key="task.id" v-bind="task" />
      </section>
    </div>
  </div>
</template>
