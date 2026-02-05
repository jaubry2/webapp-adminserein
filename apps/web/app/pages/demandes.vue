<script setup lang="ts">
const { getAllDemandes } = await import("~/utils/demandes");

const toutesLesDemandes = getAllDemandes();

const searchQuery = ref("");

const filteredDemandes = computed(() => {
  if (!searchQuery.value) {
    return toutesLesDemandes;
  }
  const query = searchQuery.value.toLowerCase();
  return toutesLesDemandes.filter(
    (demande) =>
      demande.titre.toLowerCase().includes(query) ||
      demande.organisme.toLowerCase().includes(query)
  );
});
</script>

<template>
  <div class="min-h-screen bg-white px-8 py-8 font--text">
    <div class="mx-auto flex max-w-6xl justify-center">
      <!-- Carte principale -->
      <section
        class="relative w-full rounded-md border secondary--border--color bg-tertiary px-10 py-10 shadow-sm"
      >
        <!-- Bouton fermer -->
        <NuxtLink
          to="/patients"
          class="absolute right-6 top-6 text-red-500 transition-colors hover:text-red-700"
        >
          <UIcon name="i-lucide-x" class="h-7 w-7" />
        </NuxtLink>

        <!-- Titre -->
        <h1
          class="mb-10 text-center text-4xl font-semibold secondary--text--color font--title"
        >
          Nouvelle demande
        </h1>

        <!-- Barre de recherche -->
        <div class="mb-10 flex justify-center">
          <div class="relative w-full max-w-xl">
            <UIcon
              name="i-lucide-search"
              class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            />
            <input
              id="demande-search"
              name="demande-search"
              v-model="searchQuery"
              type="text"
              placeholder="CAF, APA, ..."
              class="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm secondary--text--color input-focus-primary"
            />
          </div>
        </div>

        <!-- Liste des demandes -->
        <div class="grid gap-6 grid-cols-2">
          <article
            v-for="demande in filteredDemandes"
            :key="demande.id"
            class="flex flex-col rounded-xl border border-gray-300 bg-white px-6 py-5 shadow-sm"
          >
            <!-- Titre -->
            <header class="mb-4 text-center">
              <h2 class="text-sm font-semibold secondary--text--color">
                {{ demande.titre }}
              </h2>
              <div class="mx-auto mt-2 h-px w-10 bg-gray-300" />
            </header>

            <!-- Infos -->
            <div class="mb-4 space-y-2 text-sm">
              <div class="flex items-center gap-2">
                <UIcon
                  name="i-lucide-clock"
                  class="h-4 w-4 quaternary--text--color"
                />
                <span class="quaternary--text--color">
                  {{ demande.dureeMinutes }} min
                </span>
              </div>
              <div class="flex items-center gap-2">
                <UIcon
                  name="i-lucide-building-2"
                  class="h-4 w-4 quaternary--text--color"
                />
                <span class="quaternary--text--color">
                  {{ demande.organisme }}
                </span>
              </div>
            </div>

            <!-- Description -->
            <p class="mb-4 text-xs leading-snug quaternary--text--color">
              {{ demande.description }}
            </p>

            <!-- Bouton action -->
            <div class="mt-auto flex justify-center">
              <button
                type="button"
                class="rounded-full border border-gray-300 bg-[#a7c7e7] px-4 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:opacity-90"
              >
                Faire la demande
              </button>
            </div>
          </article>

          <!-- Etat vide -->
          <div
            v-if="filteredDemandes.length === 0"
            class="col-span-full py-8 text-center"
          >
            <p class="text-sm quaternary--text--color">
              Aucune demande ne correspond à "{{ searchQuery }}"
            </p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
