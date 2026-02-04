<template>
  <div class="rounded-lg border border-gray-200 bg-white">
    <button
      type="button"
      @click="coordonneesExpanded = !coordonneesExpanded"
      class="flex w-full items-center justify-between border-b border-gray-200 px-6 py-4 text-left"
    >
      <h2 class="text-lg font-semibold secondary--text--color">Coordonnées</h2>
      <UIcon
        :name="coordonneesExpanded ? 'i-lucide-minus' : 'i-lucide-plus'"
        class="h-5 w-5 quaternary--text--color"
      />
    </button>

    <div v-if="coordonneesExpanded" class="p-6">
      <div class="space-y-4">
        <div>
          <span class="text-sm quaternary--text--color"
            >Numéro de téléphone :</span
          >
          <p class="mt-1 font-semibold secondary--text--color">
            {{ patient.telephone || "Non renseigné" }}
          </p>
        </div>
        <div>
          <span class="text-sm quaternary--text--color">Adresse mail :</span>
          <p class="mt-1 font-semibold secondary--text--color">
            {{ patient.email || "Non renseigné" }}
          </p>
        </div>
        <div v-if="patient.adresse">
          <span class="text-sm quaternary--text--color">Adresse :</span>
          <p class="mt-1 font-semibold secondary--text--color">
            {{ patient.adresse }}, {{ patient.codePostal }}
            {{ patient.ville }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  patient: {
    type: Object as PropType<Patient>,
    required: true,
  },
});

const coordonneesExpanded = ref(true);
</script>

<style></style>
