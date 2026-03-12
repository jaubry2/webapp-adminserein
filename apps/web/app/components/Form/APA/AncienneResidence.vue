<template>
  <div class="flex flex-col gap-2">
    <h2 class="text-3xl text-center">Ancienne résidence</h2>
    <FormRadioInput
      question="Le demandeur réside-t-il à l'adresse précédemment renseignée depuis moins de 3 mois ?"
      :options="{
        oui: 'Oui',
        non: 'Non',
      }"
      @update="
        if ($event === 'oui') {
          isOpen = true;
        } else {
          isOpen = false;
        }
      "
    />
    <div v-show="isOpen" class="flex flex-col gap-2">
      <FormInput
        placeholder="Ancienne adresse du demandeur (numéro et voie)"
        :value="getValue(fields, 'demandeur_old_adresse')"
        @updateValue="
          (val) => modifyValue('demandeur_old_adresse', val, fields)
        "
      />
      <FormInput
        placeholder="Code postal de l'ancienne résidence"
        :value="getValue(fields, 'demandeur_old_code_postal')"
        @updateValue="
          (val) => modifyValue('demandeur_old_code_postal', val, fields)
        "
      />
      <FormInput
        placeholder="Ville de l'ancienne résidence"
        :value="getValue(fields, 'demandeur_old_ville')"
        @updateValue="(val) => modifyValue('demandeur_old_ville', val, fields)"
      />
      <FormDate
        placeholder="Date d'entrée dans la nouvelle résidence :"
        :modelValue="getValue(fields, 'demandeur_date_arrivee')"
        @updateValue="modifyValue('demandeur_date_arrivee', $event, fields)"
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
const props = defineProps<{
  apa_fields: Ref<any>;
}>();
const emit = defineEmits(["updateApaFields"]);
/* VARIABLES REACTIVES */
const fields = props.apa_fields;
const isOpen = ref(false);
/**************************************************************************************************************/
/* METHODES */
/**************************************************************************************************************/
</script>

<style></style>
