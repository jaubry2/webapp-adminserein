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
      :modelValue="getValue(fields, 'mesure_protection')"
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
        :modelValue="getValue(fields, 'mesure_protection_type')"
        @update="modifyValue('mesure_protection_type', $event, fields)"
      />
      <p class="text-xl text-bold py-4">
        Information de l'organisme de protection juridique ou du mandataire
      </p>
      <FormInput
        placeholder="Nom de l'organisme"
        :value="getValue(fields, 'organisme_mesure_protection_nom')"
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
          :modelValue="
            getValue(fields, 'personne_organisme_mesure_protection_sexe')
          "
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
        :value="getValue(fields, 'personne_organisme_mesure_protection_nom')"
        @updateValue="
          (val) =>
            modifyValue('personne_organisme_mesure_protection_nom', val, fields)
        "
      />
      <FormInput
        placeholder="Prénom"
        :value="getValue(fields, 'personne_organisme_mesure_protection_prenom')"
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
        :value="getValue(fields, 'personne_organisme_mesure_protection_adresse')"
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
        :value="
          getValue(fields, 'personne_organisme_mesure_protection_code_postal')
        "
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
        :value="getValue(fields, 'personne_organisme_mesure_protection_ville')"
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
        :value="
          getValue(fields, 'personne_organisme_mesure_protection_telephone')
        "
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
        :value="getValue(fields, 'personne_organisme_mesure_protection_mail')"
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
const props = defineProps<{
  apa_fields: Ref<any>;
}>();
const emit = defineEmits(["updateApaFields"]);
/* VARIABLES REACTIVES */
const fields = props.apa_fields;
const mesureProtection = ref("");
/**************************************************************************************************************/
/* METHODES */
/**************************************************************************************************************/
</script>

<style></style>
