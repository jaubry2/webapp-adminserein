<template>
  <div class="flex flex-col gap-2">
    <h2 class="text-3xl text-center">
      Autres prestations de soutien à l’autonomie
    </h2>
    <p class="text-xl">
      Le demandeur perçoit-il une ou plusieurs des prestations suivantes ?
    </p>
    <div class="pl-4">
      <FormRadioInput
        question="L’Allocation compensatrice pour tierce personne (ACTP)"
        :options="{
          est_demandeur_actp_oui: 'Oui',
          est_demandeur_actp_non: 'Non',
        }"
        :modelValue="getValue(fields, 'demandeur_actp')"
        @update="modifyValue('demandeur_actp', $event, fields)"
      />
      <FormRadioInput
        question="L’Aide à domicile au titre de l’aide sociale départementale"
        :options="{
          est_demandeur_aide_sociale_departementale_oui: 'Oui',
          est_demandeur_aide_sociale_departementale_non: 'Non',
        }"
        :modelValue="getValue(fields, 'demandeur_aide_sociale_departementale')"
        @update="
          modifyValue('demandeur_aide_sociale_departementale', $event, fields)
        "
      />
      <FormRadioInput
        question="La Majoration pour aide constante d’une tierce personne (MTP)"
        :options="{
          est_demandeur_mtp_oui: 'Oui',
          est_demandeur_mtp_non: 'Non',
        }"
        :modelValue="getValue(fields, 'demandeur_mtp')"
        @update="modifyValue('demandeur_mtp', $event, fields)"
      />
      <FormRadioInput
        question="La Prestation de compensation du handicap (PCH)"
        :options="{
          est_demandeur_pch_oui: 'Oui',
          est_demandeur_pch_non: 'Non',
        }"
        :modelValue="getValue(fields, 'demandeur_pch')"
        @update="modifyValue('demandeur_pch', $event, fields)"
      />
      <FormRadioInput
        question="La Prestation complémentaire pour recours à tierce personne (PCRTP)"
        :options="{
          est_demandeur_pcrtp_oui: 'Oui',
          est_demandeur_pcrtp_non: 'Non',
        }"
        :modelValue="getValue(fields, 'demandeur_pcrtp')"
        @update="modifyValue('demandeur_pcrtp', $event, fields)"
      />
    </div>
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
/* SYNCHRONISATION AVEC LE PARENT */
/**************************************************************************************************************/
watch(
  () => props.apa_fields,
  (newVal) => {
    fields.value = JSON.parse(JSON.stringify(newVal));
  },
  { deep: true },
);
/**************************************************************************************************************/
/* METHODES */
/**************************************************************************************************************/
</script>

<style></style>
