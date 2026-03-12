<template>
  <div class="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
    <h2 class="text-sm font-semibold secondary--text--color font--title">
      Identité et situation MDPH
    </h2>

    <!-- Sexe -->
    <div class="flex flex-col gap-1">
      <p class="text-xs font-medium quaternary--text--color">
        Sexe du demandeur
      </p>
      <div class="flex gap-3 text-xs quaternary--text--color">
        <label class="inline-flex items-center gap-1">
          <input
            type="radio"
            class="h-3 w-3"
            :checked="getValue(fields, 'mdph_demandeur_sexe') === 'est_demandeur_femme'"
            @change="modifyValue('mdph_demandeur_sexe', 'est_demandeur_femme', fields)"
          />
          Femme
        </label>
        <label class="inline-flex items-center gap-1">
          <input
            type="radio"
            class="h-3 w-3"
            :checked="getValue(fields, 'mdph_demandeur_sexe') === 'est_demandeur_homme'"
            @change="modifyValue('mdph_demandeur_sexe', 'est_demandeur_homme', fields)"
          />
          Homme
        </label>
      </div>
    </div>

    <!-- Nationalité -->
    <div class="flex flex-col gap-1">
      <p class="text-xs font-medium quaternary--text--color">
        Nationalité
      </p>
      <div class="flex flex-wrap gap-3 text-xs quaternary--text--color">
        <label class="inline-flex items-center gap-1">
          <input
            type="radio"
            class="h-3 w-3"
            :checked="getValue(fields, 'mdph_demandeur_nationalite') === 'est_nationalite_francaise'"
            @change="modifyValue('mdph_demandeur_nationalite', 'est_nationalite_francaise', fields)"
          />
          Française
        </label>
        <label class="inline-flex items-center gap-1">
          <input
            type="radio"
            class="h-3 w-3"
            :checked="getValue(fields, 'mdph_demandeur_nationalite') === 'est_nationalite_eee'"
            @change="modifyValue('mdph_demandeur_nationalite', 'est_nationalite_eee', fields)"
          />
          EEE
        </label>
        <label class="inline-flex items-center gap-1">
          <input
            type="radio"
            class="h-3 w-3"
            :checked="getValue(fields, 'mdph_demandeur_nationalite') === 'est_nationalite_autre'"
            @change="modifyValue('mdph_demandeur_nationalite', 'est_nationalite_autre', fields)"
          />
          Autre
        </label>
      </div>
    </div>

    <!-- Type de demande -->
    <div class="flex flex-col gap-1">
      <p class="text-xs font-medium quaternary--text--color">
        Type de demande
      </p>
      <div class="flex flex-wrap gap-3 text-xs quaternary--text--color">
        <label class="inline-flex items-center gap-1">
          <input
            type="radio"
            class="h-3 w-3"
            :checked="getValue(fields, 'mdph_type_demande') === 'est_premiere_demande'"
            @change="modifyValue('mdph_type_demande', 'est_premiere_demande', fields)"
          />
          Première demande
        </label>
        <label class="inline-flex items-center gap-1">
          <input
            type="radio"
            class="h-3 w-3"
            :checked="getValue(fields, 'mdph_type_demande') === 'est_renouvellement'"
            @change="modifyValue('mdph_type_demande', 'est_renouvellement', fields)"
          />
          Renouvellement
        </label>
        <label class="inline-flex items-center gap-1">
          <input
            type="radio"
            class="h-3 w-3"
            :checked="getValue(fields, 'mdph_type_demande') === 'est_rייvaluation'"
            @change="modifyValue('mdph_type_demande', 'est_rייvaluation', fields)"
          />
          Réévaluation
        </label>
      </div>
    </div>

    <!-- Bouton de validation locale -->
    <button
      class="bg-[var(--primary-color)] text-white px-6 py-2 rounded transition self-center mt-4 text-xs font-medium"
      @click="emit('updateMdphFields', fields)"
    >
      Valider cette section
    </button>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits } from "vue";
import type { Ref } from "vue";
import type { infoFormulaire } from "~/types";
import { getValue, modifyValue } from "~/composables/useInfoFormulaire";

const props = defineProps<{
  mdph_fields: Ref<infoFormulaire>;
}>();

const emit = defineEmits(["updateMdphFields"]);

const fields = props.mdph_fields;
</script>

