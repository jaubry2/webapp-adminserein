<template>
  <div class="flex flex-col gap-2">
    <h2 class="text-3xl text-center">
      Identification de l'organisme compétent
    </h2>
    <FormRadioInput
      question="Le demandeur peut-il se lever seul (même avec difficulté) ?"
      :options="{
        est_identification_organisme_lever_oui: 'Oui',
        est_identification_organisme_lever_non: 'Non',
      }"
      :modelValue="getValue(fields, 'est_identification_organisme_lever')"
      @update="
        modifyValue('est_identification_organisme_lever', $event, fields)
      "
    />
    <FormRadioInput
      question="Le demandeur peut-il s’habiller seul (même avec difficulté) ?"
      :options="{
        est_identification_organisme_habiller_oui: 'Oui',
        est_identification_organisme_habiller_non: 'Non',
      }"
      :modelValue="getValue(fields, 'est_identification_organisme_habiller')"
      @update="
        modifyValue('est_identification_organisme_habiller', $event, fields)
      "
    />
    <FormRadioInput
      question="Le demandeur peut-il faire sa toilette seul (même avec difficulté) ?"
      :options="{
        est_identification_organisme_toilette_oui: 'Oui',
        est_identification_organisme_toilette_non: 'Non',
      }"
      :modelValue="getValue(fields, 'est_identification_organisme_toilette')"
      @update="
        modifyValue('est_identification_organisme_toilette', $event, fields)
      "
    />
    <FormRadioInput
      question="Le demandeur peut-il manger seul (même avec difficulté) ?"
      :options="{
        est_identification_organisme_manger_oui: 'Oui',
        est_identification_organisme_manger_non: 'Non',
      }"
      :modelValue="getValue(fields, 'est_identification_organisme_manger')"
      @update="
        modifyValue('est_identification_organisme_manger', $event, fields)
      "
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
