<template>
  <div class="flex flex-col gap-2">
    <h2 class="text-3xl text-center">Situation Familiale</h2>

    <FormRadioInput
      question="Nature de la relation :"
      :options="{
        est_demandeur_celibataire: 'Célibataire',
        est_demandeur_marie: 'Marié(e)',
        est_demandeur_pacse: 'Pacsé(e)',
        est_demandeur_concubinage: 'En concubinage',
        est_demandeur_divorce_separe: 'Divorcé(e) / Séparé(e)',
        est_demandeur_veuf: 'Veuf / Veuve',
      }"
      :col="true"
      @update="modifyValue('demandeur_situation_familiale', $event, fields)"
    />
    <div v-show="isOpen" class="flex flex-col gap-2">
      <h2 class="text-3xl text-center">Information du conjoint</h2>
      <div class="flex justify-center">
        <FormRadioInput
          question=" "
          :options="{
            est_demandeur_femme: 'Madame',
            est_demandeur_homme: 'Monsieur',
          }"
          :modelValue="getValue(fields, 'conjoint_sexe')"
          @update="modifyValue('conjoint_sexe', $event, fields)"
        />
      </div>
      <FormInput
        placeholder="Nom de naissance"
        :value="getValue(fields, 'conjoint_nom_naissance')"
        @updateValue="
          (val) => modifyValue('conjoint_nom_naissance', val, fields)
        "
      />
      <FormInput
        placeholder="Nom d'usage (Si différent du nom de naissance)"
        :value="getValue(fields, 'conjoint_nom_usage')"
        @updateValue="(val) => modifyValue('conjoint_nom_usage', val, fields)"
      />
      <FormInput
        placeholder="Prénom"
        :value="getValue(fields, 'conjoint_prenom')"
        @updateValue="(val) => modifyValue('conjoint_prenom', val, fields)"
      />
      <FormDate
        placeholder="Date de naissance :"
        :modelValue="getValue(fields, 'conjoint_date_naissance')"
        @updateValue="modifyValue('conjoint_date_naissance', $event, fields)"
      />
      <FormInput
        placeholder="Lieu de naissance"
        :value="getValue(fields, 'conjoint_ville_naissance')"
        @updateValue="
          (val) => modifyValue('conjoint_ville_naissance', val, fields)
        "
      />
      <FormInput
        placeholder="Département de naissance"
        :value="getValue(fields, 'conjoint_departement_naissance')"
        @updateValue="
          (val) => modifyValue('conjoint_departement_naissance', val, fields)
        "
      />
      <FormInput
        placeholder="Pays de naissance"
        :value="getValue(fields, 'conjoint_pays_naissance')"
        @updateValue="
          (val) => modifyValue('conjoint_pays_naissance', val, fields)
        "
      />
      <FormInput
        placeholder="Numéro de sécurité sociale"
        :value="getValue(fields, 'conjoint_numero_securite_sociale')"
        @updateValue="
          (val) => modifyValue('conjoint_numero_securite_sociale', val, fields)
        "
      />
      <FormRadioInput
        question="Domicile :"
        :options="{
          est_conjoint_domicile_identique_demandeur:
            'Domicile identique à celui du demandeur',
          est_conjoint_domicile_accueillant:
            'Domicile d’un accueillant familial (particulier agréé par le département)',
          est_conjoint_domicile_ehpad:
            'Établissement d’hébergement pour personnes âgées dépendantes',
          est_conjoint_domicile_autre: 'Autre',
        }"
        :col="true"
        :modelValue="getValue(fields, 'conjoint_domicile')"
        @update="(val) => modifyValue('conjoint_domicile', val, fields)"
      />
      <FormInput
        placeholder="Précisez le domicile"
        :value="getValue(fields, 'conjoint_domicile_autre')"
        @updateValue="
          (val) => modifyValue('conjoint_domicile_autre', val, fields)
        "
        v-show="
          getValue(fields, 'conjoint_domicile') ===
          'est_conjoint_domicile_autre'
        "
      />
      <FormDate
        placeholder="Date d'entrée dans l'EHPAD :"
        :modelValue="getValue(fields, 'conjoint_domicile_ehpad_date_entree')"
        @updateValue="
          modifyValue('conjoint_domicile_ehpad_date_entree', $event, fields)
        "
        v-show="
          getValue(fields, 'conjoint_domicile') ===
          'est_conjoint_domicile_ehpad'
        "
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
/* VARIABLES CALCULEES */
const isOpen = computed(() => {
  switch (getValue(fields.value, "demandeur_situation_familiale")) {
    case "est_demandeur_marie":
      return true;
    case "est_demandeur_pacse":
      return true;
    case "est_demandeur_concubinage":
      return true;
    default:
      return false;
  }
});
/**************************************************************************************************************/
/* SYNCHRONISATION AVEC LE PARENT */
/**************************************************************************************************************/
watch(
  () => props.apa_fields,
  (newVal) => {
    fields.value = newVal;
    console.log("FormSituationFamiliale", fields.value);
  },
  { deep: true },
);
/**************************************************************************************************************/
/* METHODES */
/**************************************************************************************************************/
</script>

<style></style>
