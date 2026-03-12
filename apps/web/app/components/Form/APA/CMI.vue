<template>
  <div class="flex flex-col gap-2">
    <h2 class="text-3xl text-center">Carte mobilité inclusion (CMI)</h2>
    <FormRadioInput
      question="Le demandeur souhaite-t-il une CMI mention Stationnement ?"
      :options="{
        est_demandeur_cmi_stationnement_oui: 'Oui',
        est_demandeur_cmi_stationnement_non: 'Non',
      }"
      :modelValue="getValue(fields, 'demandeur_cmi_stationnement')"
      @update="modifyValue('demandeur_cmi_stationnement', $event, fields)"
    />
    <FormRadioInput
      question="Le demandeur souhaite-t-il une CMI mention Priorité ou Invalidité ?"
      :options="{
        est_demandeur_cmi_priorite_invalidite_oui: 'Oui',
        est_demandeur_cmi_priorite_invalidite_non: 'Non',
      }"
      :modelValue="getValue(fields, 'demandeur_cmi_priorite_invalidite')"
      @update="modifyValue('demandeur_cmi_priorite_invalidite', $event, fields)"
    />
    <FormRadioInput
      question="Le demandeur souhaite-t-il renouveler sa carte d’invalidité, de priorité ou de stationnement ?"
      :options="{
        est_demandeur_cmi_renouveller_oui: 'Oui',
        est_demandeur_cmi_renouveller_non: 'Non',
      }"
      :modelValue="getValue(fields, 'demandeur_cmi_renouveller')"
      @update="modifyValue('demandeur_cmi_renouveller', $event, fields)"
    />
    <button
      class="bg-[var(--primary-color)] text-white px-6 py-2 rounded transition self-center mt-4"
      @click="emit('updateApaFields', fields)"
    >
      Valider
    </button>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits } from "vue";
/**************************************************************************************************************/
/* PARAMETRES */
/**************************************************************************************************************/
/* VARIABLES SYSTEMES */
const props = defineProps<{
  apa_fields: Ref<any>;
}>();
const emit = defineEmits(["updateApaFields"]);
/* VARIABLES REACTIVES */
const fields = props.apa_fields;
/**************************************************************************************************************/
/* METHODES */
/**************************************************************************************************************/
</script>

<style></style>
