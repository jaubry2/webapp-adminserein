<template>
  <div class="flex flex-col gap-2">
    <h2 class="text-3xl text-center">
      Signature du demandeur et/ou de son représentant légal
    </h2>
    <div class="flex justify-center">
      <FormRadioInput
        question=" "
        :options="{
          est_signature_femme: 'Madame',
          est_signature_homme: 'Monsieur',
        }"
        @update="modifyValue('personne_signature_sexe', $event, fields)"
      />
    </div>
    <FormInput
      placeholder="Nom de la personne signataire"
      @updateValue="(val) => modifyValue('personne_signature_nom', val, fields)"
    />
    <FormInput
      placeholder="Prénom de la personne signataire"
      @updateValue="
        (val) => modifyValue('personne_signature_prenom', val, fields)
      "
    />
    <FormRadioInput
      question=" Agissant :"
      :options="{
        est_signature_pour_soi: 'En mon nom',
        est_signature_pour_quelquun: 'En qualité de représentant légal de :',
      }"
      :col="true"
      @update="modifyValue('personne_signature_pour', $event, fields)"
    />
    <FormInput
      v-if="
        getValue(fields, 'personne_signature_pour') ===
        'est_signature_pour_quelquun'
      "
      placeholder="Précisez la personne représentée"
      @updateValue="
        (val) => modifyValue('personne_signature_pour_quelquun', val, fields)
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
</script>

<style></style>
