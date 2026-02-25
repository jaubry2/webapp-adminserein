<template>
  <div class="rounded-lg border border-gray-200 bg-white">
    <div
      class="flex w-full items-center justify-between border-b border-gray-200 px-6 py-4"
    >
      <button
        type="button"
        @click="conjointExpanded = !conjointExpanded"
        class="flex-1 text-left cursor-pointer"
      >
        <h2 class="text-lg font-semibold secondary--text--color">Conjoint</h2>
      </button>
      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="conjointExpanded = !conjointExpanded"
          class="cursor-pointer ml-2"
        >
          <UIcon
            :name="conjointExpanded ? 'i-lucide-minus' : 'i-lucide-plus'"
            class="h-5 w-5 quaternary--text--color"
          />
        </button>
      </div>
    </div>

    <div v-if="conjointExpanded" class="p-6">
      <p
        v-if="!patient.conjoint"
        class="text-sm quaternary--text--color"
      >
        Aucun conjoint renseigné.
      </p>
      <div
        v-else
        class="grid grid-cols-2 gap-4"
      >
        <div>
          <span class="text-sm quaternary--text--color">Nom :</span>
          <p class="mt-1 font-semibold secondary--text--color">
            {{ patient.conjoint?.nom || "Non renseigné" }}
          </p>
        </div>
        <div>
          <span class="text-sm quaternary--text--color">Prénom :</span>
          <p class="mt-1 font-semibold secondary--text--color">
            {{ patient.conjoint?.prenom || "Non renseigné" }}
          </p>
        </div>
        <div>
          <span class="text-sm quaternary--text--color"
            >Nom de naissance :</span
          >
          <p class="mt-1 font-semibold secondary--text--color">
            {{
              patient.conjoint?.nomNaissance ||
              patient.conjoint?.nom ||
              "Non renseigné"
            }}
          </p>
        </div>
        <div>
          <span class="text-sm quaternary--text--color"
            >Autres prénoms :</span
          >
          <p class="mt-1 font-semibold secondary--text--color">
            {{ patient.conjoint?.autresPrenoms || "Aucun" }}
          </p>
        </div>
        <div>
          <span class="text-sm quaternary--text--color">Sexe :</span>
          <p class="mt-1 font-semibold secondary--text--color">
            {{ patient.conjoint?.sexe || "Non renseigné" }}
          </p>
        </div>
        <div>
          <span class="text-sm quaternary--text--color"
            >Date de naissance :</span
          >
          <p class="mt-1 font-semibold secondary--text--color">
            {{ patient.conjoint?.dateNaissance || "Non renseigné" }}
          </p>
        </div>
        <div>
          <span class="text-sm quaternary--text--color"
            >Lieu de naissance :</span
          >
          <p class="mt-1 font-semibold secondary--text--color">
            {{ patient.conjoint?.lieuNaissance || "Non renseigné" }}
          </p>
        </div>
        <div>
          <span class="text-sm quaternary--text--color"
            >Département de naissance :</span
          >
          <p class="mt-1 font-semibold secondary--text--color">
            {{
              patient.conjoint?.departementNaissance || "Non renseigné"
            }}
          </p>
        </div>
        <div>
          <span class="text-sm quaternary--text--color"
            >Pays de naissance :</span
          >
          <p class="mt-1 font-semibold secondary--text--color">
            {{ patient.conjoint?.paysNaissance || "Non renseigné" }}
          </p>
        </div>
        <div>
          <span class="text-sm quaternary--text--color">Nationalités :</span>
          <p class="mt-1 font-semibold secondary--text--color">
            {{ patient.conjoint?.nationalites || "Non renseigné" }}
          </p>
        </div>
        <div>
          <span class="text-sm quaternary--text--color"
            >Numéro de sécurité sociale :</span
          >
          <p class="mt-1 font-semibold secondary--text--color">
            {{
              patient.conjoint?.numeroSecuriteSociale || "Non renseigné"
            }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Patient } from "~/types/patient";

const props = defineProps<{
  patient: Patient;
}>();

const conjointExpanded = ref(true);
</script>

