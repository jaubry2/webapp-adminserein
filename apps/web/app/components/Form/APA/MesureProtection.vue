<template>
  <div class="flex flex-col gap-2">
    <h2 class="text-3xl text-center">Mesure de protection</h2>
    <FormRadioInput
      question="Le demandeur fait-il l’objet d’une mesure de protection ?"
      :options="{
        est_demandeur_mesure_protection_prononcee:
          'Oui, la mesure a été prononcée',
        est_demandeur_mesure_protection_demandee:
          'Non, mais une demande est en cours',
        est_demandeur_mesure_protection_non: 'Non',
      }"
      :col="true"
      @update="modifyValue('mesure_protection', $event, fields)"
    />
    <div
      v-show="
        getValue(fields, 'mesure_protection') ===
        'est_demandeur_mesure_protection_prononcee'
      "
      class="flex flex-col gap-2"
    >
      <FormRadioInput
        question="Préciser la nature de la protection :"
        :options="{
          est_demandeur_mesure_protection_sauvegarde_justice:
            'Sauvegarde de justice',
          est_demandeur_mesure_protection_curatelle_simple: 'Curatelle simple',
          est_demandeur_mesure_protection_curatelle_renforcee:
            'Curatelle renforcée',
          est_demandeur_mesure_protection_tutelle: 'Tutelle',
          est_demandeur_mesure_protection_habitation_familiale:
            'Habitation familiale',
          est_demandeur_mesure_protection_mandat_protection:
            'Mandat de protection future',
        }"
        :col="true"
        @update="modifyValue('mesure_protection_type', $event, fields)"
      />
      <p class="text-xl text-bold py-4">
        Information de l'organisme de protection juridique ou du mandataire
      </p>
      <FormInput
        placeholder="Nom de l'organisme"
        @updateValue="
          (val) => modifyValue('organisme_mesure_protection_nom', val, fields)
        "
      />
      <div class="flex justify-center">
        <FormRadioInput
          question=" "
          :options="{
            est_personne_organisme_mesure_protection_femme: 'Madame',
            est_personne_organisme_mesure_protection_homme: 'Monsieur',
          }"
          @update="
            modifyValue(
              'personne_organisme_mesure_protection_sexe',
              $event,
              fields,
            )
          "
        />
      </div>
      <FormInput
        placeholder="Nom"
        @updateValue="
          (val) =>
            modifyValue('personne_organisme_mesure_protection_nom', val, fields)
        "
      />
      <FormInput
        placeholder="Prénom"
        @updateValue="
          (val) =>
            modifyValue(
              'personne_organisme_mesure_protection_prenom',
              val,
              fields,
            )
        "
      />
      <FormInput
        placeholder="Adresse (Numéro et rue)"
        @updateValue="
          (val) =>
            modifyValue(
              'personne_organisme_mesure_protection_adresse',
              val,
              fields,
            )
        "
      />
      <FormInput
        placeholder="Code postal"
        @updateValue="
          (val) =>
            modifyValue(
              'personne_organisme_mesure_protection_code_postal',
              val,
              fields,
            )
        "
      />
      <FormInput
        placeholder="Commune / Ville"
        @updateValue="
          (val) =>
            modifyValue(
              'personne_organisme_mesure_protection_ville',
              val,
              fields,
            )
        "
      />
      <FormInput
        placeholder="Téléphone"
        @updateValue="
          (val) =>
            modifyValue(
              'personne_organisme_mesure_protection_telephone',
              val,
              fields,
            )
        "
      />
      <FormInput
        placeholder="Adresse e-mail"
        @updateValue="
          (val) =>
            modifyValue(
              'personne_organisme_mesure_protection_mail',
              val,
              fields,
            )
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
const mesureProtection = ref("");
/**************************************************************************************************************/
/* METHODES */
/**************************************************************************************************************/
</script>

<style></style>
