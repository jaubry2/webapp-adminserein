<template>
  <div class="rounded-lg border border-gray-200 bg-white">
    <button
      type="button"
      @click="identiteExpanded = !identiteExpanded"
      class="flex w-full items-center justify-between border-b border-gray-200 px-6 py-4 text-left"
    >
      <h2 class="text-lg font-semibold secondary--text--color">Identité</h2>
      <UIcon
        :name="identiteExpanded ? 'i-lucide-minus' : 'i-lucide-plus'"
        class="h-5 w-5 quaternary--text--color"
      />
    </button>
    <div v-if="identiteExpanded" class="p-6">
      <div class="grid grid-cols-2 gap-6">
        <!-- Colonne gauche -->
        <div class="space-y-4">
          <div>
            <span class="text-sm quaternary--text--color">Nom :</span>
            <p class="mt-1 font-semibold secondary--text--color">
              {{ patient.nom || "Non renseigné" }}
            </p>
          </div>
          <div>
            <span class="text-sm quaternary--text--color">Prénom :</span>
            <p class="mt-1 font-semibold secondary--text--color">
              {{ patient.prenom || "Non renseigné" }}
            </p>
          </div>
          <div>
            <span class="text-sm quaternary--text--color">Sexe :</span>
            <p class="mt-1 font-semibold secondary--text--color">
              {{ patient.sexe || "Non renseigné" }}
            </p>
          </div>
          <div>
            <span class="text-sm quaternary--text--color"
              >Lieu de naissance :</span
            >
            <p class="mt-1 font-semibold secondary--text--color">
              {{ patient.lieuNaissance || "Non renseigné" }}
            </p>
          </div>
          <div>
            <span class="text-sm quaternary--text--color"
              >Pays de naissance :</span
            >
            <p class="mt-1 font-semibold secondary--text--color">
              {{ patient.paysNaissance || "Non renseigné" }}
            </p>
          </div>
        </div>

        <!-- Colonne droite -->
        <div class="space-y-4">
          <div>
            <span class="text-sm quaternary--text--color"
              >Nom de naissance :</span
            >
            <p class="mt-1 font-semibold secondary--text--color">
              {{ patient.nomNaissance || patient.nom }}
            </p>
          </div>
          <div>
            <span class="text-sm quaternary--text--color"
              >Autres prénoms :</span
            >
            <p class="mt-1 font-semibold secondary--text--color">
              {{ patient.autresPrenoms || "Aucun" }}
            </p>
          </div>
          <div>
            <span class="text-sm quaternary--text--color"
              >Date de naissance :</span
            >
            <p class="mt-1 font-semibold secondary--text--color">
              {{ patient.dateNaissance }}
            </p>
          </div>
          <div>
            <span class="text-sm quaternary--text--color"
              >Département de naissance :</span
            >
            <p class="mt-1 font-semibold secondary--text--color">
              {{ patient.departementNaissance || "Non renseigné" }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Patient } from "~/types/patient";

const props = defineProps({
  patient: {
    type: Object as PropType<Patient>,
    required: true,
  },
});

const identiteExpanded = ref(true);
</script>

<style></style>
