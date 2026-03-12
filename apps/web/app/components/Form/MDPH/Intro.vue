<template>
  <div class="flex flex-col gap-2">
    <h2 class="text-3xl text-center">Ce que vous devez Remplir</h2>
    <div class="flex justify-center">
      <FormRadioInput
        question=" "
        :options="{
          est_premiere_demande: 'Première demande à la MDPH',
          est_changement_situation:
            'Situation médicale, administrative, familiale ou mon projet a changé',
          est_réévaluation:
            'Souhaite une réévaluation de ma situation et/ou une révision de mes droits',
        }"
        :modelValue="getValue(fields, 'quoi_remplir_1')"
        @update="modifyValue('quoi_remplir_1', $event, fields)"
      />
    </div>
    <div class="flex justify-center">
      <FormCheckInput
        question=" "
        :options="{
          est_renouvellement:
            'Souhaite le renouvellement de mes droits à l’identique car j’estime que ma situation n’a pas changé',
        }"
        :modelValue="getValue(fields, 'quoi_remplir_2')"
        @update="modifyValue('quoi_remplir_2', $event, fields)"
      />
    </div>
    <div class="flex justify-center">
      <FormCheckInput
        question=""
        :options="{
          est_expression_aidant:
            'Votre aidant familial (la personne qui s’occupe de vous au quotidien) souhaite exprimer sa situation et ses besoins',
        }"
        :modelValue="getValue(fields, 'quoi_remplir_3')"
        @update="modifyValue('quoi_remplir_3', $event, fields)"
      />
    </div>
    <div class="flex justify-center">
      <FormCheckInput
        question="Vous avez déjà un dossier à la MDPH ?"
        :options="{
          est_deja_dossier_oui: 'Oui',
        }"
        :modelValue="getValue(fields, 'deja_dossier')"
        @update="modifyValue('deja_dossier', $event, fields)"
      />
    </div>
    <FormInput
      placeholder="Dans quel département ?"
      :value="getValue(fields, 'dossier_departement')"
      @updateValue="(val) => modifyValue('dossier_departement', val, fields)"
    />
    <FormInput
      placeholder="Numéro de dossier MDPH"
      :value="getValue(fields, 'numero_dossier_mdph')"
      @updateValue="(val) => modifyValue('numero_dossier_mdph', val, fields)"
    />
    <button
      class="bg-[var(--primary-color)] text-white px-6 py-2 rounded transition self-center mt-4"
      @click="emit('updateMdphFields', fields)"
    >
      Valider
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

<style></style>
