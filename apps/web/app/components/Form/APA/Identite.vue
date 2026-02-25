<template>
  <div class="flex flex-col gap-2">
    <h2 class="text-3xl text-center">Identité du demandeur</h2>
    <div class="flex justify-center">
      <FormRadioInput
        question=" "
        :options="{
          est_demandeur_femme: 'Madame',
          est_demandeur_homme: 'Monsieur',
        }"
        @update="modifyValue('demandeur_sexe', $event, fields)"
      />
    </div>
    <FormInput
      placeholder="Nom de naissance"
      @updateValue="
        (val) => modifyValue('demandeur_nom_naissance', val, fields)
      "
    />
    <FormInput
      placeholder="Nom d'usage (Si différent du nom de naissance)"
      @updateValue="(val) => modifyValue('demandeur_nom_usage', val, fields)"
    />
    <FormInput
      placeholder="Prénom"
      @updateValue="(val) => modifyValue('demandeur_prenom', val, fields)"
    />
    <FormDate
      placeholder="Date de naissance :"
      @updateValue="modifyValue('demandeur_date_naissance', $event, fields)"
    />
    <FormInput
      placeholder="Lieu de naissance"
      @updateValue="
        (val) => modifyValue('demandeur_ville_naissance', val, fields)
      "
    />
    <FormInput
      placeholder="Département de naissance"
      @updateValue="
        (val) => modifyValue('demandeur_departement_naissance', val, fields)
      "
    />
    <FormInput
      placeholder="Pays de naissance"
      @updateValue="
        (val) => modifyValue('demandeur_pays_naissance', val, fields)
      "
    />
    <FormInput
      placeholder="Numéro de sécurité sociale"
      @updateValue="
        (val) => modifyValue('demandeur_numero_securite_sociale', val, fields)
      "
    />
    <FormRadioInput
      question="Caisse de retraite principales :"
      :options="{
        est_demandeur_retraite_assurance_maladie: 'Assurance Retraite',
        est_demandeur_retraite_fonction_publique: 'Fonction Publique d\'État',
        est_demandeur_retraite_msa: 'MSA',
        est_demandeur_retraite_autre: 'Autre',
      }"
      :col="true"
      @update="modifyValue('demandeur_caisse_retraite', $event, fields)"
    />
    <FormInput
      v-show="
        getValue(fields, 'demandeur_caisse_retraite') ===
        'est_demandeur_retraite_autre'
      "
      placeholder="Précisez la caisse de retraite"
      @updateValue="
        (val) => modifyValue('demandeur_caisse_retraite_autre', val, fields)
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
import type { infoFormulaire } from "~/types";
/**************************************************************************************************************/
/* PARAMETRES */
/**************************************************************************************************************/
/* VARIABLES SYSTEMES */
const props = defineProps({
  apa_fields: {
    type: Object as () => infoFormulaire,
    required: true,
  },
});
const emit = defineEmits(["updateApaFields"]);
/* VARIABLES REACTIVES */
const fields = ref(props.apa_fields);
/**************************************************************************************************************/
/* METHODES */
/**************************************************************************************************************/
// On regarde la variable adresseInput pour récupérer les adresses de l'API
</script>

<style></style>
