<template>
  <div class="rounded-lg border border-gray-200 bg-white p-6">
    <div class="relative">
      <!-- Timeline verticale -->
      <div
        v-for="(event, index) in evenements"
        :key="event.id"
        class="relative flex gap-6 pb-8 last:pb-0"
      >
        <!-- Ligne verticale -->
        <div
          v-if="index < evenements.length - 1"
          class="absolute left-3 top-8 h-full w-0.5 bg-gray-300"
        ></div>

        <!-- Date et heure à gauche -->
        <div class="flex shrink-0 flex-col items-end gap-1 pt-1">
          <span class="text-sm font-medium secondary--text--color">
            {{ event.date }}
          </span>
          <span class="text-xs quaternary--text--color">
            {{ event.heure }}
          </span>
        </div>

        <!-- Point de la timeline -->
        <div class="relative shrink-0">
          <div
            class="h-6 w-6 rounded-full bg-gray-200 border-2 border-white shadow-sm"
          ></div>
        </div>

        <!-- Contenu de l'événement -->
        <div class="flex-1 pb-2">
          <h3 class="text-base font-semibold secondary--text--color mb-1">
            {{ event.titre }}
          </h3>
          <p class="text-sm quaternary--text--color">
            {{ event.description }}
          </p>
        </div>
      </div>

      <!-- Message si aucun événement -->
      <div v-if="evenements.length === 0" class="py-12 text-center">
        <p class="text-sm quaternary--text--color">
          Aucun événement dans l'historique
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EvenementHistorique } from "~/types/historique";

const props = defineProps<{
  evenements: EvenementHistorique[];
}>();
</script>

<style scoped></style>
