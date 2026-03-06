<template>
  <div class="flex flex-col gap-2">
    <h2 class="text-3xl text-center">Ressources et Patrimoine</h2>
    <FormInput
      placeholder="Adresse (numéro et rue)"
      :value="getValue(fields, 'demandeur_residence_principal_adresse')"
      @updateValue="
        (val) =>
          modifyValue('demandeur_residence_principal_adresse', val, fields)
      "
    />
    <FormInput
      placeholder="Code postal"
      :value="getValue(fields, 'demandeur_residence_principal_code_postal')"
      @updateValue="
        (val) =>
          modifyValue('demandeur_residence_principal_code_postal', val, fields)
      "
    />
    <FormInput
      placeholder="Ville"
      :value="getValue(fields, 'demandeur_residence_principal_ville')"
      @updateValue="
        (val) => modifyValue('demandeur_residence_principal_ville', val, fields)
      "
    />
    <FormRadioInput
      question="Le demandeur est :"
      :options="{
        est_demandeur_residence_principale_proprietaire:
          'Propriétaire de sa résidence principale',
        est_demandeur_residence_principale_locataire:
          'Locataire de sa résidence principale',
      }"
      :col="true"
      :modelValue="
        getValue(fields, 'demandeur_residence_principale_proprietaire')
      "
      @update="
        modifyValue(
          'demandeur_residence_principale_proprietaire',
          $event,
          fields,
        )
      "
    />
    <FormRadioInput
      v-show="
        getValue(fields, 'demandeur_residence_principale_proprietaire') ===
        'est_demandeur_residence_principale_proprietaire'
      "
      question="La résidence est :"
      :options="{
        est_residence_principale_habite_famille:
          'Occupée par le demandeur et/ou son conjoint, et/ou ses enfants, petits-enfants',
        est_residence_principale_habite_tiers: 'Louée à un tiers',
        est_residence_principale_habite_non_louee:
          'Non louée (vide ou occupée à titre gracieux par un tiers autre que le conjoint et les enfants et petits-enfants du demandeur)',
      }"
      :col="true"
      :modelValue="getValue(fields, 'habitant_residence_principal')"
      @update="modifyValue('habitant_residence_principal', $event, fields)"
    />
    <p class="text-xl font-bold">
      Autres biens immobiliers (maison, appartement, terrain, etc.) du demandeur
      et de son conjoint
    </p>
    <div class="pl-2 flex flex-col gap-2">
      <FormInput
        placeholder="Adresse 1 (numéro et rue)"
        :value="getValue(fields, 'demandeur_residence_1_adresse')"
        @updateValue="
          (val) => modifyValue('demandeur_residence_1_adresse', val, fields)
        "
      />
      <FormInput
        placeholder="Code postal"
        :value="getValue(fields, 'demandeur_residence_1_code_postal')"
        @updateValue="
          (val) => modifyValue('demandeur_residence_1_code_postal', val, fields)
        "
      />
      <FormInput
        placeholder="Ville"
        :value="getValue(fields, 'demandeur_residence_1_ville')"
        @updateValue="
          (val) => modifyValue('demandeur_residence_1_ville', val, fields)
        "
      /><FormInput
        placeholder="Adresse 2 (numéro et rue)"
        :value="getValue(fields, 'demandeur_residence_2_adresse')"
        @updateValue="
          (val) => modifyValue('demandeur_residence_2_adresse', val, fields)
        "
      />
      <FormInput
        placeholder="Code postal"
        :value="getValue(fields, 'demandeur_residence_2_code_postal')"
        @updateValue="
          (val) => modifyValue('demandeur_residence_2_code_postal', val, fields)
        "
      />
      <FormInput
        placeholder="Ville"
        :value="getValue(fields, 'demandeur_residence_2_ville')"
        @updateValue="
          (val) => modifyValue('demandeur_residence_2_ville', val, fields)
        "
      />
      <FormInput
        placeholder="Adresse 3 (numéro et rue)"
        :value="getValue(fields, 'demandeur_residence_3_adresse')"
        @updateValue="
          (val) => modifyValue('demandeur_residence_3_adresse', val, fields)
        "
      />
      <FormInput
        placeholder="Code postal"
        :value="getValue(fields, 'demandeur_residence_3_code_postal')"
        @updateValue="
          (val) => modifyValue('demandeur_residence_3_code_postal', val, fields)
        "
      />
      <FormInput
        placeholder="Ville"
        :value="getValue(fields, 'demandeur_residence_3_ville')"
        @updateValue="
          (val) => modifyValue('demandeur_residence_3_ville', val, fields)
        "
      />
    </div>
    <p class="text-xl font-bold">
      Biens mobiliers et capitaux non placés de valeur du demandeur et de son
      conjoint
    </p>
    <div class="pl-2 flex flex-col gap-2">
      <div class="flex flex-row gap-4">
        <FormInput
          placeholder="Nature du bien 1"
          :value="getValue(fields, 'demandeur_bien_1')"
          @updateValue="(val) => modifyValue('demandeur_bien_1', val, fields)"
        />
        <FormInput
          placeholder="Prix du bien 1"
          :value="getValue(fields, 'demandeur_bien_prix_1')"
          @updateValue="
            (val) => modifyValue('demandeur_bien_prix_1', val, fields)
          "
        />
      </div>
      <div class="flex flex-row gap-4">
        <FormInput
          placeholder="Nature du bien 2"
          :value="getValue(fields, 'demandeur_bien_2')"
          @updateValue="(val) => modifyValue('demandeur_bien_2', val, fields)"
        />
        <FormInput
          placeholder="Prix du bien 2"
          :value="getValue(fields, 'demandeur_bien_prix_2')"
          @updateValue="
            (val) => modifyValue('demandeur_bien_prix_2', val, fields)
          "
        />
      </div>
      <div class="flex flex-row gap-4">
        <FormInput
          placeholder="Nature du bien 3"
          :value="getValue(fields, 'demandeur_bien_3')"
          @updateValue="(val) => modifyValue('demandeur_bien_3', val, fields)"
        />
        <FormInput
          placeholder="Prix du bien 3"
          :value="getValue(fields, 'demandeur_bien_prix_3')"
          @updateValue="
            (val) => modifyValue('demandeur_bien_prix_3', val, fields)
          "
        />
      </div>
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
    fields.value = newVal;
  },
  { deep: true },
);
/**************************************************************************************************************/
/* METHODES */
/**************************************************************************************************************/
</script>

<style></style>
