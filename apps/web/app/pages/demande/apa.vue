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

        <p class="text-xs quaternary--text--color" v-if="isProfessionnel">
          Sélectionnez le patient pour lequel vous remplissez cette demande
          d'APA, ou continuez sans patient pour remplir le formulaire
          manuellement.
        </p>
        <p class="text-xs quaternary--text--color" v-else-if="isParticulier">
          Cette demande sera remplie pour vous-même. Vos informations seront
          utilisées pour pré-remplir le formulaire.
        </p>

        <!-- Sélection de patient pour les professionnels -->
        <template v-if="isProfessionnel">
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
              <option :value="null">Sans patient (saisie manuelle)</option>
              <option
                v-for="patient in patientOptions"
                :key="patient.id"
                :value="patient.id"
              >
                {{ patient.label }}
              </option>
            </select>

            <p v-if="!selectedPatientId" class="text-xs quaternary--text--color">
              Le formulaire sera vide, vous pourrez saisir les informations manuellement.
            </p>
          </div>
        </template>

        <!-- Affichage du patient pour les particuliers -->
        <template v-else-if="isParticulier">
          <div v-if="isLoadingParticulierPatient" class="text-xs quaternary--text--color">
            Chargement de vos informations patient...
          </div>
          <div v-else-if="isErrorParticulierPatient" class="text-xs text-red-500">
            Impossible de charger vos informations patient.
          </div>
          <div v-else-if="selectedPatient" class="text-sm secondary--text--color">
            <p class="font-medium">
              {{
                selectedPatient.informationIdentite
                  ? `${selectedPatient.informationIdentite.prenom} ${selectedPatient.informationIdentite.nomUsage || selectedPatient.informationIdentite.nomNaissance}`
                  : "Patient inconnu"
              }}
            </p>
            <p class="text-xs quaternary--text--color">
              Vos informations personnelles seront utilisées pour pré-remplir le formulaire.
            </p>
          </div>
        </template>
      </div>
    </section>

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
        <!--
        <ToDoListAPA :apa-fields="fields" v-if="isAPADemande" />
        <ToDoListADPA :apa-fields="fields" v-if="!isAPADemande" />
        -->
      </div>
      <button
        class="text-white px-6 py-2 rounded transition"
        @click="modifyDocument()"
      >
        Télécharger le formulaire APA rempli
      </button>
      <button
        class="text-white px-6 py-2 rounded transition"
        @click="downloadToList()"
      >
        Télécharger la to-do List
      </button>

      <button
        class="rounded-full border border-gray-300 bg-[#a7c7e7] px-6 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:opacity-90 disabled:opacity-50"
        :disabled="isSavingDemande"
        @click="saveDemande()"
      >
        <span v-if="isSavingDemande">Enregistrement...</span>
        <span v-else-if="editDemandeId">Mettre à jour la demande</span>
        <span v-else>Enregistrer la demande</span>
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
import { useQuery, useMutation, skipToken } from "@tanstack/vue-query";

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
const toast = useToast();

/* VARIABLES REACTIVES */

const editDemandeId = ref<string | null>(
  typeof route.query.demandeId === "string" ? route.query.demandeId : null,
);

const fields = ref<infoFormulaire>(apa_fields);

// Type d'utilisateur
const { data: userTypeData } = useQuery({
  ...$orpc.getUserType.queryOptions(),
});

const userType = computed(() => userTypeData.value?.type || null);
const isProfessionnel = computed(() => userType.value === "PROFESSIONNEL");
const isParticulier = computed(() => userType.value === "PARTICULIER");

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

// Récupération des patients suivis par le professionnel (uniquement si pro)
const {
  data: apiPatients,
  isLoading: isLoadingPatients,
  isError: isErrorPatients,
} = useQuery({
  ...$orpc.listPatients.queryOptions(),
  enabled: computed(() => isProfessionnel.value),
});

// Récupération du patient du particulier connecté (uniquement si particulier)
const {
  data: particulierPatient,
  isLoading: isLoadingParticulierPatient,
  isError: isErrorParticulierPatient,
} = useQuery({
  ...$orpc.getPatientByIdForParticulier.queryOptions(),
  enabled: computed(() => isParticulier.value),
});

const patientOptions = computed<PatientOption[]>(() => {
  if (!isProfessionnel.value || !apiPatients.value) return [];

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
  if (isParticulier.value) {
    return particulierPatient.value ?? null;
  }

  if (!apiPatients.value || !selectedPatientId.value) return null;
  return (
    apiPatients.value.find((p: any) => p.id === selectedPatientId.value) ?? null
  );
});

const prefillFormFromPatient = (patient: any) => {
  if (!patient) return;
  const info = patient.informationIdentite ?? {};
  const coord = patient.informationCoordonnee ?? {};

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

  if (info.genre === "FEMININ") {
    modifyValue("demandeur_sexe", "est_demandeur_femme", fields.value);
  } else if (info.genre === "MASCULIN") {
    modifyValue("demandeur_sexe", "est_demandeur_homme", fields.value);
  }

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

  if (info.caisseRetraite) {
    let caisseValue = "";
    switch (info.caisseRetraite) {
      case "ASSURANCE_RETRAITE":
        caisseValue = "est_demandeur_retraite_assurance_maladie";
        break;
      case "FONCTION_PUBLIQUE_ETAT":
        caisseValue = "est_demandeur_retraite_fonction_publique";
        break;
      case "MSA":
        caisseValue = "est_demandeur_retraite_msa";
        break;
      case "AUTRE":
      default:
        caisseValue = "est_demandeur_retraite_autre";
        break;
    }
    modifyValue("demandeur_caisse_retraite", caisseValue, fields.value);
  }
};

watch(
  () => selectedPatient.value,
  (p) => {
    if (p && !editDemandeId.value) {
      prefillFormFromPatient(p);
    }
  },
  { immediate: true },
);

/* CHARGEMENT D'UNE DEMANDE EXISTANTE (MODE EDITION) */

const demandeSaved = ref(false);

const { data: existingDemande } = useQuery(
  computed(() => ({
    ...$orpc.getDemandeById.queryOptions({
      input: editDemandeId.value
        ? { demandeId: editDemandeId.value }
        : skipToken,
    }),
    enabled: !!editDemandeId.value,
  }))
);

watch(
  () => existingDemande.value,
  (d) => {
    if (!d) return;
    if (d.donneesFormulaire) {
      fields.value = d.donneesFormulaire as infoFormulaire;
    }
    if (d.patientId) {
      selectedPatientId.value = d.patientId;
    }
    demandeSaved.value = true;
  },
);

/* VARIABLES CALCULEES */

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

/* SAUVEGARDE DE LA DEMANDE */

const isSavingDemande = ref(false);

const createDemandeMutation = useMutation({
  ...$orpc.createDemande.mutationOptions(),
  onSuccess: (data: any) => {
    demandeSaved.value = true;
    if (data?.id) {
      editDemandeId.value = data.id;
    }
    toast.add({
      title: "Demande enregistrée",
      description: "La demande a été sauvegardée avec succès.",
    });
  },
  onError: (error: any) => {
    toast.add({
      title: "Erreur",
      description: error?.message || "Impossible d'enregistrer la demande.",
      color: "error",
    });
  },
  onSettled: () => {
    isSavingDemande.value = false;
  },
});

const updateDemandeMutation = useMutation({
  ...$orpc.updateDemande.mutationOptions(),
  onSuccess: () => {
    toast.add({
      title: "Demande mise à jour",
      description: "Les modifications ont été sauvegardées.",
    });
  },
  onError: (error: any) => {
    toast.add({
      title: "Erreur",
      description: error?.message || "Impossible de mettre à jour la demande.",
      color: "error",
    });
  },
  onSettled: () => {
    isSavingDemande.value = false;
  },
});

const saveDemande = async () => {
  isSavingDemande.value = true;

  const nomBeneficiaire =
    getValue(fields.value, "demandeur_nom_naissance") ||
    getValue(fields.value, "demandeur_nom_usage") ||
    undefined;
  const prenomBeneficiaire =
    getValue(fields.value, "demandeur_prenom") || undefined;

  const donneesFormulaire = JSON.parse(JSON.stringify(fields.value));

  if (editDemandeId.value) {
    await updateDemandeMutation.mutateAsync({
      demandeId: editDemandeId.value,
      nomBeneficiaire: nomBeneficiaire || undefined,
      prenomBeneficiaire: prenomBeneficiaire || undefined,
      donneesFormulaire,
    });
  } else {
    await createDemandeMutation.mutateAsync({
      typeDemande: "APA",
      patientId: selectedPatientId.value ?? undefined,
      nomBeneficiaire: nomBeneficiaire || undefined,
      prenomBeneficiaire: prenomBeneficiaire || undefined,
      donneesFormulaire,
    });
  }
};

/* PDF */

async function loadPdfForm(pdfUrl: string) {
  const existingPdfBytes = await fetch(pdfUrl).then((res) => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  return pdfDoc;
}

async function downloadToList() {
  const { default: html2pdf } = await import("html2pdf.js");

  const element = document.getElementById("element-to-convert");

  if (element) {
    (element as HTMLElement).style.display = "block";

    await nextTick();

    html2pdf(element, {
      margin: 1,
      filename: "Recap.pdf",
    }).finally(() => {
      (element as HTMLElement).style.display = "none";
    });
  } else {
    console.error("Élément 'element-to-convert' introuvable.");
  }
}

async function modifyDocument() {
  const pdf_doc = await loadPdfForm("/pdf/apa_remplissable.pdf");
  const form = pdf_doc.getForm();
  const field_names = form.getFields().map((field: any) => field.getName());

  Object.keys(fields.value).forEach((key) => {
    const value = getValue(fields.value, key);
    const fields_list = getListFieldForm(fields.value, key);
    if (value === "") {
      null;
    } else if (fields_list.length === 1) {
      if (field_names.includes(fields_list[0])) {
        form.getTextField(fields_list[0]).setText(value);
      }
    } else if (fields_list[0].startsWith("est")) {
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
      for (let i = 0; i < fields_list.length; i++) {
        form.getTextField(fields_list[i]).setText(charList[i] || "");
      }
    }
  });

  const pdfBytes = await pdf_doc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "apa_rempli_test.pdf";
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

const updateFields = (_apa_fields: infoFormulaire, _nextPage: string) => {
  fields.value = _apa_fields;
  router.push({
    query: {
      step: _nextPage,
      ...(isProfessionnel.value && selectedPatientId.value
        ? { patientId: selectedPatientId.value }
        : {}),
      ...(editDemandeId.value
        ? { demandeId: editDemandeId.value }
        : {}),
    },
  });
};
</script>

<style></style>
