<template>
  <div class="flex flex-col gap-2">
    <h2 class="text-3xl text-center">Coordonnées du demandeur</h2>
    <FormInput
      placeholder="Numéro de téléphone"
      @updateValue="
        (val) => modifyValue('demandeur_numero_telephone', val, fields)
      "
    />
    <FormInput
      placeholder="Adresse e-mail"
      @updateValue="(val) => modifyValue('demandeur_mail', val, fields)"
    />
    <FormRadioInput
      question="Domicile au moment de la demande :"
      :options="{
        est_demandeur_domicile_demandeur: 'Domicile du demandeur',
        est_demandeur_domicile_famille:
          'Domicile d’un membre de la famille du demandeur',
        est_demandeur_domicile_accueillant:
          'Domicile d’un accueillant familial (particulier agréé par le département)',
        est_demandeur_domicile_residence: 'Résidence autonomie / EHPAD',
        est_demandeur_domicile_autre: 'Autre',
      }"
      :col="true"
      @update="modifyValue('demandeur_lieu_residence', $event, fields)"
    />
    <FormInput
      v-if="
        getValue(fields, 'demandeur_lieu_residence') ===
        'est_demandeur_domicile_autre'
      "
      placeholder="Précisez le lieu de résidence"
      @updateValue="
        (val) => modifyValue('demandeur_lieu_residence_autre', val, fields)
      "
    />
    <FormInput
      v-if="
        getValue(fields, 'demandeur_lieu_residence') ===
        'est_demandeur_domicile_autre'
      "
      placeholder="Précisez le lieu de résidence"
      @updateValue="
        (val) => modifyValue('demandeur_lieu_residence_autre', val, fields)
      "
    />
    <div class="relative">
      <FormInput
        placeholder="Adresse (Numéro et voie)"
        @updateValue="(val) => handleAddressInput(val)"
        :value="getValue(fields, 'demandeur_adresse')"
      />

      <div
        v-if="adresses.length > 0"
        class="absolute z-10 w-full bg-white border border-gray-300 rounded-b shadow-lg max-h-48 overflow-y-auto"
      >
        <div
          v-for="adresse in adresses"
          :key="adresse.properties.id"
          @click="selectAddress(adresse)"
          class="p-3 cursor-pointer hover:bg-gray-100 border-b last:border-b-0"
        >
          {{ adresse.properties.label }}
        </div>
      </div>
      <div></div>
    </div>
    <FormInput
      placeholder="Code postal"
      @updateValue="(val) => modifyValue('demandeur_code_postal', val, fields)"
      :value="getValue(fields, 'demandeur_code_postal')"
    />
    <FormInput
      placeholder="Ville"
      @updateValue="(val) => modifyValue('demandeur_ville', val, fields)"
      :value="getValue(fields, 'demandeur_ville')"
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
const adresses = ref([]);
/**************************************************************************************************************/
/* METHODES */
/**************************************************************************************************************/
/* FONCTIONS SYSTEMES */
watch(
  () => {
    return getValue(fields.value, "demandeur_adresse");
  },
  (newValue: String) => {
    const chaine = newValue.replace(/ /g, "+");
    if (chaine.length > 3) {
      fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${chaine}&type=housenumber&autocomplete=1`,
      )
        .then((response) => response.json())
        .then((result) => (adresses.value = result.features))
        .catch((error) => console.log("error", error));
    } else {
      console.log("Chaine trop courte");
    }
  },
);
/* FONCTIONS */
const handleAddressInput = (val: string) => {
  // 1. Mettre à jour la valeur dans le formulaire (pour que le watch soit déclenché)
  modifyValue("demandeur_adresse", val, fields.value);
  // 2. Le watch ci-dessous fera la requête API.
};
// Cette méthode est appelée lorsqu'une suggestion est cliquée
const selectAddress = (adresse: any) => {
  const props = adresse.properties;
  console.log(props);
  // 1. Mettre à jour l'adresse complète
  modifyValue("demandeur_adresse", props.name, fields.value);
  console.log("demandeur_adresse", fields.value.demandeur_adresse);
  // 2. Remplir automatiquement le Code Postal
  modifyValue("demandeur_code_postal", props.postcode, fields.value);

  // 3. Remplir automatiquement la Ville
  // Utiliser la propriété `city` si elle est disponible, sinon `context`
  const city = props.city || props.context.split(",").pop().trim();
  modifyValue("demandeur_ville", city, fields.value);

  // 4. Cacher les suggestions après la sélection
  adresses.value = [];
};
</script>

<style></style>
