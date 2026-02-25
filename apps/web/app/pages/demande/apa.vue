<template>
  <div class="p-8 flex flex-col items-center gap-8">
    <FormAPAIdentite
      class="w-[50%]"
      :apa_fields="fields"
      @updateApaFields="updateFields($event, 'coordonnee')"
      v-show="currentStep === 'identite'"
    />
    <FormAPACoordonnee
      class="w-[50%]"
      :apa_fields="fields"
      @updateApaFields="updateFields($event, 'ancienneResidence')"
      v-show="currentStep === 'coordonnee'"
    />
    <FormAPAAncienneResidence
      class="w-[50%]"
      :apa_fields="fields"
      @updateApaFields="updateFields($event, 'situationFamiliale')"
      v-show="currentStep === 'ancienneResidence'"
    />
    <FormAPASituationFamiliale
      class="w-[50%]"
      :apa_fields="fields"
      @updateApaFields="updateFields($event, 'mesureProtection')"
      v-show="currentStep === 'situationFamiliale'"
    />
    <FormAPAMesureProtection
      class="w-[50%]"
      :apa_fields="fields"
      @updateApaFields="updateFields($event, 'personneProche')"
      v-show="currentStep === 'mesureProtection'"
    />
    <FormAPAPersonneProche
      class="w-[50%]"
      :apa_fields="fields"
      @updateApaFields="updateFields($event, 'organismeCompetent')"
      v-show="currentStep === 'personneProche'"
    />
    <FormAPAOrganismeCompetent
      class="w-[50%]"
      :apa_fields="fields"
      @updateApaFields="updateFields($event, 'autrePrestation')"
      v-show="currentStep === 'organismeCompetent'"
    />
    <FormAPAAutrePrestation
      class="w-[50%]"
      :apa_fields="fields"
      @updateApaFields="updateFields($event, 'patrimoine')"
      v-show="currentStep === 'autrePrestation'"
    />
    <FormAPAPatrimoine
      class="w-[50%]"
      :apa_fields="fields"
      @updateApaFields="updateFields($event, 'cmi')"
      v-show="currentStep === 'patrimoine'"
    />
    <FormAPACMI
      class="w-[50%]"
      :apa_fields="fields"
      @updateApaFields="updateFields($event, 'signature')"
      v-show="currentStep === 'cmi'"
    />
    <FormAPASignature
      class="w-[50%]"
      :apa_fields="fields"
      @updateApaFields="updateFields($event, 'validation')"
      v-show="currentStep === 'signature'"
    />
    <!--Validate Form-->
    <div v-show="currentStep === 'validation'" class="flex flex-col gap-8">
      <div id="element-to-convert" style="display: none">
        <p>Test</p>
        <ToDoListAPA :apa-fields="fields" v-if="isAPADemande" />
        <ToDoListADPA :apa-fields="fields" v-if="!isAPADemande" />
      </div>
      <button
        class="text-white px-6 py-2 rounded transition"
        @click="modifyDocument()"
      >
        Télécharger le formualaire APA rempli
      </button>
      <button
        class="text-white px-6 py-2 rounded transition"
        @click="downloadToList()"
      >
        Télécharger la to-do List
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { apa_fields } from "~/utils/demandes/apa_fields";
import { PDFDocument } from "pdf-lib";
import { getListFieldForm, getValue } from "~/composables/useInfoFormulaire";
import type { infoFormulaire } from "~/types";

definePageMeta({
  middleware: ["auth"],
});

/**********/
/* PARAMETRES */
/**********/
/* VARIABLES SYSTEMES */

const route = useRoute();
const router = useRouter();

/* VARIABLES REACTIVES */

const fields = ref<infoFormulaire>(apa_fields);

/* VARIALBES CALCULEES */

const currentStep = computed(() => route.query.step || "identite");
const isAPADemande = computed(() => {
  let nbOui = 0;
  if (
    getValue(fields.value, "est_identification_organisme_lever") ===
    "est_identification_organisme_lever_oui"
  ) {
    nbOui++;
  }
  if (
    getValue(fields.value, "est_identification_organisme_habiller") ===
    "est_identification_organisme_habiller_oui"
  ) {
    nbOui++;
  }
  if (
    getValue(fields.value, "est_identification_organisme_toilette") ===
    "est_identification_organisme_toilette_oui"
  ) {
    nbOui++;
  }
  if (
    getValue(fields.value, "est_identification_organisme_manger") ===
    "est_identification_organisme_manger_oui"
  ) {
    nbOui++;
  }
  if (nbOui <= 1) {
    return true;
  } else {
    return false;
  }
});

/* Charge le PDF et retorune le document */

async function loadPdfForm(pdfUrl: string) {
  // 1. Récupérer le PDF (depuis vos assets locaux ou un serveur)
  const existingPdfBytes = await fetch(pdfUrl).then((res) => res.arrayBuffer());

  // 2. Charger le document PDF
  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  return pdfDoc;
}
async function downloadToList() {
  const { default: html2pdf } = await import("html2pdf.js");

  const element = document.getElementById("element-to-convert");

  if (element) {
    // 1. Rendre l'élément visible juste avant la capture
    (element as HTMLElement).style.display = "block";

    await nextTick(); // Assure que le DOM a bien appliqué le style 'block'

    // 2. Lancer la conversion (elle renvoie une promesse)
    html2pdf(element, {
      margin: 1,
      filename: "Recap.pdf",
    })
      // 3. .finally() s'exécute une fois le processus de création/téléchargement terminé
      .finally(() => {
        // 4. Masquer l'élément immédiatement
        (element as HTMLElement).style.display = "none";
      });
  } else {
    console.error("Élément 'element-to-convert' introuvable.");
  }
}
async function modifyDocument() {
  // On charge le document PDF
  const pdf_doc = await loadPdfForm("/pdf/apa_remplissable.pdf");
  // On récupère le formulaire du document
  const form = pdf_doc.getForm();
  // Liste des champs du formulaire du document
  const field_names = form.getFields().map((field: any) => field.getName());
  // Faire une boucle sur les champs APA, récupérer les champs du document et les modifier
  Object.keys(fields.value).forEach((key) => {
    const value = getValue(fields.value, key);
    const fields_list = getListFieldForm(fields.value, key);
    if (value === "") {
      null;
    } else if (fields_list.length === 1) {
      // C'est un champ texte simple
      if (field_names.includes(fields_list[0])) {
        form.getTextField(fields_list[0]).setText(value);
      }
    } else if (fields_list[0].startsWith("est")) {
      // C'est un champ radio
      form.getCheckBox(value).check();
    } else {
      let charList = value.split("");
      if (charList.includes("-")) {
        const wait = [
          charList[8],
          charList[9],
          charList[5],
          charList[6],
          charList[0],
          charList[1],
          charList[2],
          charList[3],
        ];
        charList = wait;
      }
      // On remplit les champs un par un
      for (let i = 0; i < fields_list.length; i++) {
        form.getTextField(fields_list[i]).setText(charList[i] || "");
      }
    }
  });
  // ----------------------------------------------------
  // 2. Sérialiser le PDF modifié
  // ----------------------------------------------------
  const pdfBytes = await pdf_doc.save();
  // ----------------------------------------------------
  // 3. Créer un Blob et déclencher le téléchargement
  // ----------------------------------------------------
  const blob = new Blob([pdfBytes], { type: "application/pdf" });

  // Créer un lien temporaire pour le téléchargement
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);

  // Nom du fichier téléchargé
  link.download = "apa_rempli_test.pdf";
  // Simuler le clic pour lancer le téléchargement
  document.body.appendChild(link);
  link.click();

  // Nettoyer l'URL temporaire et l'élément link
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
const updateFields = (_apa_fields: infoFormulaire, _nextPage: string) => {
  fields.value = _apa_fields;
  router.push({ query: { step: _nextPage } });
};
</script>

<style></style>
