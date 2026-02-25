<template>
  <div class="flex flex-col gap-2">
    <h2 class="text-3xl text-center">Personne proche à contacter</h2>
    <div class="flex justify-center">
      <FormRadioInput
        question=" "
        :options="{
          est_personne_proche_femme: 'Madame',
          est_personne_proche_homme: 'Monsieur',
        }"
        @update="modifyValue('personne_proche_sexe', $event, fields)"
      />
    </div>
    <FormInput
      placeholder="Nom"
      @updateValue="(val) => modifyValue('personne_proche_nom', val, fields)"
    />
    <FormInput
      placeholder="Prénom"
      @updateValue="(val) => modifyValue('personne_proche_prenom', val, fields)"
    />
    <FormInput
      placeholder="Adresse (Numéro et voie)"
      @updateValue="
        (val) => modifyValue('personne_proche_adresse', val, fields)
      "
    />
    <FormInput
      placeholder="Code postal"
      @updateValue="
        (val) => modifyValue('personne_proche_code_postal', val, fields)
      "
    />
    <FormInput
      placeholder="Commune / Ville"
      @updateValue="(val) => modifyValue('personne_proche_ville', val, fields)"
    />
    <FormInput
      placeholder="Numéro de téléphone"
      @updateValue="
        (val) => modifyValue('personne_proche_telephone', val, fields)
      "
    />
    <FormInput
      placeholder="Adresse e-mail"
      @updateValue="(val) => modifyValue('personne_proche_mail', val, fields)"
    />
    <FormRadioInput
      question="Domicile au moment de la demande :"
      :options="{
        est_personne_proche_lien_enfant: 'Enfant',
        est_personne_proche_lien_conjoint: 'Conjoint',
        est_personne_proche_lien_ami: 'Ami',
        est_personne_proche_lien_voisin: 'Voisin',
        est_personne_proche_lien_autre: 'Autre',
      }"
      :col="true"
      @update="modifyValue('personne_proche_lien', $event, fields)"
    />
    <FormInput
      v-if="
        getValue(fields, 'personne_proche_lien') ===
        'est_personne_proche_lien_autre'
      "
      placeholder="Précisez le lieu de résidence"
      @updateValue="
        (val) => modifyValue('personne_proche_lien_autre', val, fields)
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
