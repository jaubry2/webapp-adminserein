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
        :modelValue="getValue(fields, 'demandeur_sexe')"
        @update="modifyValue('demandeur_sexe', $event, fields)"
      />
    </div>
    <FormInput
      placeholder="Nom de naissance"
      :value="getValue(fields, 'demandeur_nom_naissance')"
      @updateValue="
        (val) => modifyValue('demandeur_nom_naissance', val, fields)
      "
    />
    <FormInput
      placeholder="Nom d'usage (Si différent du nom de naissance)"
      :value="getValue(fields, 'demandeur_nom_usage')"
      @updateValue="(val) => modifyValue('demandeur_nom_usage', val, fields)"
    />
    <FormInput
      placeholder="Prénom"
      :value="getValue(fields, 'demandeur_prenom')"
      @updateValue="(val) => modifyValue('demandeur_prenom', val, fields)"
    />
    <FormDate
      placeholder="Date de naissance :"
      :modelValue="getValue(fields, 'demandeur_date_naissance')"
      @updateValue="modifyValue('demandeur_date_naissance', $event, fields)"
    />
    <FormInput
      placeholder="Lieu de naissance"
      :value="getValue(fields, 'demandeur_ville_naissance')"
      @updateValue="
        (val) => modifyValue('demandeur_ville_naissance', val, fields)
      "
    />
    <FormInput
      placeholder="Département de naissance"
      :value="getValue(fields, 'demandeur_departement_naissance')"
      @updateValue="
        (val) => modifyValue('demandeur_departement_naissance', val, fields)
      "
    />
    <FormInput
      placeholder="Pays de naissance"
      :value="getValue(fields, 'demandeur_pays_naissance')"
      @updateValue="
        (val) => modifyValue('demandeur_pays_naissance', val, fields)
      "
    />
    <FormInput
      placeholder="Numéro de sécurité sociale"
      :value="getValue(fields, 'demandeur_numero_securite_sociale')"
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
      :modelValue="getValue(fields, 'demandeur_caisse_retraite')"
      @update="modifyValue('demandeur_caisse_retraite', $event, fields)"
    />
    <FormInput
      v-show="
        getValue(fields, 'demandeur_caisse_retraite') ===
        'est_demandeur_retraite_autre'
      "
      placeholder="Précisez la caisse de retraite"
      :value="getValue(fields, 'demandeur_caisse_retraite_autre')"
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
/* SYNCHRONISATION AVEC LE PARENT */
/**************************************************************************************************************/
watch(
  () => props.apa_fields,
  (newVal) => {
    fields.value = newVal as infoFormulaire;
    console.log("FormIdentite", fields.value);
  },
  { deep: true },
);
/**************************************************************************************************************/
/* METHODES */
/**************************************************************************************************************/
// On regarde la variable adresseInput pour récupérer les adresses de l'API
</script>

<style></style>
