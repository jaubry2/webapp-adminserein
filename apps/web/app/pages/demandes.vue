<script setup lang="ts">
import DemandesSelector from "~/components/NouvelleDemandeSelector.vue";

definePageMeta({
  middleware: ["auth"],
});
</script>

<template>
  <div class="min-h-screen bg-white px-8 py-8 font--text">
    <div class="mx-auto flex max-w-6xl justify-center">
      <!-- Carte principale -->
      <section
        class="relative w-full rounded-md border secondary--border--color bg-tertiary px-10 py-10 shadow-sm"
      >
        <!-- Titre -->
        <h1
          class="mb-10 text-center text-4xl font-semibold secondary--text--color font--title"
        >
          Nouvelle demande
        </h1>

        <DemandesSelector />
      </section>
    </div>
  </div>
</template>
