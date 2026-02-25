<template>
  <div class="flex flex-col gap-2">
    <h2 class="text-3xl text-center">Carte mobilité inclusion (CMI)</h2>
    <FormRadioInput
      question="Le demandeur souhaite-t-il une CMI mention Stationnement ?"
      :options="{
        est_demandeur_cmi_stationnement_oui: 'Oui',
        est_demandeur_cmi_stationnement_non: 'Non',
      }"
      @update="modifyValue('demandeur_cmi_stationnement', $event, fields)"
    />
    <FormRadioInput
      question="Le demandeur souhaite-t-il une CMI mention Priorité ou Invalidité ?"
      :options="{
        est_demandeur_cmi_priorite_invalidite_oui: 'Oui',
        est_demandeur_cmi_priorite_invalidite_non: 'Non',
      }"
      @update="modifyValue('demandeur_cmi_priorite_invalidite', $event, fields)"
    />
    <FormRadioInput
      question="Le demandeur souhaite-t-il renouveler sa carte d’invalidité, de priorité ou de stationnement ?"
      :options="{
        est_demandeur_cmi_renouveller_oui: 'Oui',
        est_demandeur_cmi_renouveller_non: 'Non',
      }"
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
const props = defineProps({
  apa_fields: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits(["updateApaFields"]);
/* VARIABLES REACTIVES */
const fields = ref(props.apa_fields);
/**************************************************************************************************************/
/* METHODES */
/**************************************************************************************************************/
function handleRadioInputValue(_key: string, _new_value: string) {
  const primary_value = fields.value[_key];
  const secondary_key = Object.keys(primary_value)[0];
  const secondary_value = primary_value[secondary_key];
  delete fields.value[_key][secondary_key];
  fields.value[_key][_new_value] = secondary_value;
}
function handleInputValue(_key: string, _new_value: string) {
  const primary_value = fields.value[_key];
  const secondary_key = Object.keys(primary_value)[0];
  const secondary_value = primary_value[secondary_key];
  delete fields.value[_key][secondary_key];
  fields.value[_key][_new_value] = secondary_value;
}
function handleDateValue(_key: string, _new_value: string) {
  const primary_value = fields.value[_key];
  const secondary_key = Object.keys(primary_value)[0];
  const secondary_value = primary_value[secondary_key];
  delete fields.value[_key][secondary_key];
  fields.value[_key][_new_value] = secondary_value;
}
</script>

<style></style>
