<template>
  <div class="p-8 flex flex-col items-center gap-8">
    <!-- Sélection du patient suivi -->
    <section class="w-full max-w-3xl mb-4">
      <div
        class="rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm flex flex-col gap-3"
      >
        <h1 class="text-lg font-semibold secondary--text--color font--title">
          Patient concerné par la demande
        </h1>

        <p class="text-xs quaternary--text--color">
          Sélectionnez le patient pour lequel vous remplissez cette demande
          d’APA.
        </p>

        <div v-if="isLoadingPatients" class="text-xs quaternary--text--color">
          Chargement de vos patients...
        </div>
        <div v-else-if="isErrorPatients" class="text-xs text-red-500">
          Impossible de charger la liste des patients.
        </div>
        <div v-else class="flex flex-col gap-2">
          <select
            v-model="selectedPatientId"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm secondary--text--color input-focus-primary"
          >
            <option :value="null">Sélectionner un patient</option>
            <option
              v-for="patient in patientOptions"
              :key="patient.id"
              :value="patient.id"
            >
              {{ patient.label }}
            </option>
          </select>

          <p v-if="!selectedPatientId" class="text-xs text-amber-600">
            Aucun patient sélectionné pour le moment.
          </p>
        </div>
      </div>
    </section>

    <FormAPAIdentite
      class="w-[50%]"
      :apa_fields="fields"
      @updateApaFields="updateFields($event, 'coordonnee')"
      v-show="currentStep === 'identite' && selectedPatientId !== null"
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
        <!--
        <ToDoListAPA :apa-fields="fields" v-if="isAPADemande" />
        <ToDoListADPA :apa-fields="fields" v-if="!isAPADemande" />
        -->
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
import {
  getListFieldForm,
  getValue,
  modifyValue,
} from "~/composables/useInfoFormulaire";
import type { infoFormulaire } from "~/types";
import type { Patient } from "~/types/patient";
import { useQuery } from "@tanstack/vue-query";

definePageMeta({
  middleware: ["auth"],
});

/**********/
/* PARAMETRES */
/**********/
/* VARIABLES SYSTEMES */

const route = useRoute();
const router = useRouter();
const { $orpc } = useNuxtApp();

/* VARIABLES REACTIVES */

const fields = ref<infoFormulaire>(apa_fields);

// Patient sélectionné pour la demande
type PatientOption = {
  id: string;
  label: string;
};

const selectedPatientId = ref<string | null>(
  typeof route.query.patientId === "string"
    ? (route.query.patientId as string)
    : null,
);

// Récupération des patients suivis par le professionnel
const {
  data: apiPatients,
  isLoading: isLoadingPatients,
  isError: isErrorPatients,
} = useQuery($orpc.listPatients.queryOptions());

const patientOptions = computed<PatientOption[]>(() => {
  if (!apiPatients.value) return [];

  return apiPatients.value.map((p: any) => {
    const info = p.informationIdentite;
    const nom = info?.nomUsage ?? info?.nomNaissance ?? "";
    const prenom = info?.prenom ?? "";
    const dossier = p.numeroDossier ? ` (${p.numeroDossier})` : "";

    return {
      id: p.id as string,
      label: `${nom} ${prenom}${dossier}`.trim(),
    };
  });
});

const selectedPatient = computed<any | null>(() => {
  if (!apiPatients.value || !selectedPatientId.value) return null;
  return (
    apiPatients.value.find((p: any) => p.id === selectedPatientId.value) ?? null
  );
});

const prefillFormFromPatient = (patient: any) => {
  if (!patient) return;
  const info = patient.informationIdentite ?? {};
  const coord = patient.informationCoordonnee ?? {};

  // Identité
  if (info.nomNaissance || info.nomUsage) {
    modifyValue(
      "demandeur_nom_naissance",
      (info.nomNaissance || info.nomUsage) as string,
      fields.value,
    );
  }
  if (info.nomUsage) {
    modifyValue("demandeur_nom_usage", info.nomUsage as string, fields.value);
  }
  if (info.prenom) {
    modifyValue("demandeur_prenom", info.prenom as string, fields.value);
  }

  // Date de naissance (format ISO YYYY-MM-DD ou string similaire)
  if (info.dateNaissance) {
    let dateStr: string;
    if (typeof info.dateNaissance === "string") {
      dateStr = info.dateNaissance;
    } else if (info.dateNaissance instanceof Date) {
      dateStr = info.dateNaissance.toISOString().slice(0, 10);
    } else {
      dateStr = String(info.dateNaissance);
    }
    modifyValue("demandeur_date_naissance", dateStr, fields.value);
  }

  if (info.villeNaissance) {
    modifyValue(
      "demandeur_ville_naissance",
      info.villeNaissance as string,
      fields.value,
    );
  }
  if (info.departementNaissance) {
    modifyValue(
      "demandeur_departement_naissance",
      info.departementNaissance as string,
      fields.value,
    );
  }
  if (info.paysNaissance) {
    modifyValue(
      "demandeur_pays_naissance",
      info.paysNaissance as string,
      fields.value,
    );
  }
  if (info.numeroSecuriteSociale) {
    modifyValue(
      "demandeur_numero_securite_sociale",
      info.numeroSecuriteSociale as string,
      fields.value,
    );
  }

  // Genre -> civilité
  if (info.genre === "FEMININ") {
    modifyValue("demandeur_sexe", "est_demandeur_femme", fields.value);
  } else if (info.genre === "MASCULIN") {
    modifyValue("demandeur_sexe", "est_demandeur_homme", fields.value);
  }

  // Coordonnées
  if (coord.numeroTelephone) {
    modifyValue(
      "demandeur_numero_telephone",
      coord.numeroTelephone as string,
      fields.value,
    );
  }
  if (coord.adresseMail) {
    modifyValue("demandeur_mail", coord.adresseMail as string, fields.value);
  }
  if (coord.adresse) {
    modifyValue("demandeur_adresse", coord.adresse as string, fields.value);
  }
  if (coord.codePostal) {
    modifyValue(
      "demandeur_code_postal",
      coord.codePostal as string,
      fields.value,
    );
  }
  if (coord.ville) {
    modifyValue("demandeur_ville", coord.ville as string, fields.value);
  }
};

watch(
  () => selectedPatient.value,
  (p) => {
    if (p) {
      prefillFormFromPatient(p);
    }
  },
  { immediate: true },
);

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
  router.push({
    query: {
      step: _nextPage,
      // conserver le patient sélectionné dans l'URL si présent
      ...(selectedPatientId.value
        ? { patientId: selectedPatientId.value }
        : {}),
    },
  });
};
</script>

<style></style>
