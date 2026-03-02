<template>
  <div class="rounded-lg border border-gray-200 bg-white">
    <div
      class="flex w-full items-center justify-between border-b border-gray-200 px-6 py-4"
    >
      <button
        type="button"
        @click="conjointExpanded = !conjointExpanded"
        class="flex-1 text-left cursor-pointer"
      >
        <h2 class="text-lg font-semibold secondary--text--color">Conjoint</h2>
      </button>
      <div class="flex items-center gap-2">
        <button
          v-if="!isEditing"
          @click="startEditing"
          type="button"
          class="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium secondary--text--color transition-colors hover:bg-gray-50"
        >
          <UIcon name="i-lucide-pencil" class="h-4 w-4" />
          Modifier
        </button>
        <button
          v-else-if="hasChanges"
          @click="handleSave"
          type="button"
          class="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
        >
          <UIcon name="i-lucide-check" class="h-4 w-4" />
          Valider
        </button>
        <button
          v-else
          @click="cancelEditing"
          type="button"
          class="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium secondary--text--color transition-colors hover:bg-gray-50"
        >
          <UIcon name="i-lucide-x" class="h-4 w-4" />
          Annuler
        </button>
        <button
          type="button"
          @click="conjointExpanded = !conjointExpanded"
          class="cursor-pointer ml-2"
        >
          <UIcon
            :name="conjointExpanded ? 'i-lucide-minus' : 'i-lucide-plus'"
            class="h-5 w-5 quaternary--text--color"
          />
        </button>
      </div>
    </div>

    <div v-if="conjointExpanded" class="p-6">
      <p
        v-if="!patient.conjoint && !isEditing"
        class="text-sm quaternary--text--color"
      >
        Aucun conjoint renseigné.
      </p>
      <div v-else class="grid grid-cols-2 gap-4">
        <div>
          <span class="text-sm quaternary--text--color">Nom :</span>
          <p
            v-if="!isEditing"
            class="mt-1 font-semibold secondary--text--color"
          >
            {{ patient.conjoint?.nom || "Non renseigné" }}
          </p>
          <input
            v-else
            v-model="editedConjoint.nomUsage"
            type="text"
            class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm input-focus-primary"
          />
        </div>
        <div>
          <span class="text-sm quaternary--text--color">Prénom :</span>
          <p
            v-if="!isEditing"
            class="mt-1 font-semibold secondary--text--color"
          >
            {{ patient.conjoint?.prenom || "Non renseigné" }}
          </p>
          <input
            v-else
            v-model="editedConjoint.prenom"
            type="text"
            class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm input-focus-primary"
          />
        </div>
        <div>
          <span class="text-sm quaternary--text--color"
            >Nom de naissance :</span
          >
          <p
            v-if="!isEditing"
            class="mt-1 font-semibold secondary--text--color"
          >
            {{
              patient.conjoint?.nomNaissance ||
              patient.conjoint?.nom ||
              "Non renseigné"
            }}
          </p>
          <input
            v-else
            v-model="editedConjoint.nomNaissance"
            type="text"
            class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm input-focus-primary"
          />
        </div>
        <div>
          <span class="text-sm quaternary--text--color">Autres prénoms :</span>
          <p
            v-if="!isEditing"
            class="mt-1 font-semibold secondary--text--color"
          >
            {{ patient.conjoint?.autresPrenoms || "Aucun" }}
          </p>
          <input
            v-else
            v-model="editedConjoint.autresPrenoms"
            type="text"
            placeholder="Séparés par des virgules"
            class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm input-focus-primary"
          />
        </div>
        <div>
          <span class="text-sm quaternary--text--color">Sexe :</span>
          <p
            v-if="!isEditing"
            class="mt-1 font-semibold secondary--text--color"
          >
            {{ patient.conjoint?.sexe || "Non renseigné" }}
          </p>
          <select
            v-else
            v-model="editedConjoint.genre"
            class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm input-focus-primary"
          >
            <option value="MASCULIN">Masculin</option>
            <option value="FEMININ">Féminin</option>
            <option value="AUTRE">Autre</option>
          </select>
        </div>
        <div>
          <span class="text-sm quaternary--text--color"
            >Date de naissance :</span
          >
          <p
            v-if="!isEditing"
            class="mt-1 font-semibold secondary--text--color"
          >
            {{ patient.conjoint?.dateNaissance || "Non renseigné" }}
          </p>
          <input
            v-else
            v-model="editedConjoint.dateNaissance"
            type="date"
            class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm input-focus-primary"
          />
        </div>
        <div>
          <span class="text-sm quaternary--text--color"
            >Lieu de naissance :</span
          >
          <p
            v-if="!isEditing"
            class="mt-1 font-semibold secondary--text--color"
          >
            {{ patient.conjoint?.lieuNaissance || "Non renseigné" }}
          </p>
          <input
            v-else
            v-model="editedConjoint.villeNaissance"
            type="text"
            class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm input-focus-primary"
          />
        </div>
        <div>
          <span class="text-sm quaternary--text--color"
            >Département de naissance :</span
          >
          <p
            v-if="!isEditing"
            class="mt-1 font-semibold secondary--text--color"
          >
            {{ patient.conjoint?.departementNaissance || "Non renseigné" }}
          </p>
          <input
            v-else
            v-model="editedConjoint.departementNaissance"
            type="text"
            class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm input-focus-primary"
          />
        </div>
        <div>
          <span class="text-sm quaternary--text--color"
            >Pays de naissance :</span
          >
          <p
            v-if="!isEditing"
            class="mt-1 font-semibold secondary--text--color"
          >
            {{ patient.conjoint?.paysNaissance || "Non renseigné" }}
          </p>
          <input
            v-else
            v-model="editedConjoint.paysNaissance"
            type="text"
            class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm input-focus-primary"
          />
        </div>
        <div>
          <span class="text-sm quaternary--text--color">Nationalités :</span>
          <p
            v-if="!isEditing"
            class="mt-1 font-semibold secondary--text--color"
          >
            {{ patient.conjoint?.nationalites || "Non renseigné" }}
          </p>
          <input
            v-else
            v-model="editedConjoint.nationalites"
            type="text"
            placeholder="Séparées par des virgules"
            class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm input-focus-primary"
          />
        </div>
        <div>
          <span class="text-sm quaternary--text--color"
            >Numéro de sécurité sociale :</span
          >
          <p
            v-if="!isEditing"
            class="mt-1 font-semibold secondary--text--color"
          >
            {{ patient.conjoint?.numeroSecuriteSociale || "Non renseigné" }}
          </p>
          <input
            v-else
            v-model="editedConjoint.numeroSecuriteSociale"
            type="text"
            class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm input-focus-primary"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Patient } from "~/types/patient";

const props = defineProps<{
  patient: Patient;
}>();

const isEditing = ref(false);
const conjointExpanded = ref(false);

const editedConjoint = ref({
  nomUsage: "",
  nomNaissance: "",
  prenom: "",
  autresPrenoms: "",
  genre: "MASCULIN" as "MASCULIN" | "FEMININ" | "AUTRE",
  dateNaissance: "",
  villeNaissance: "",
  departementNaissance: "",
  paysNaissance: "",
  nationalites: "",
  numeroSecuriteSociale: "",
});

const initializeEditedConjoint = () => {
  const c = props.patient.conjoint;
  editedConjoint.value = {
    nomUsage: c?.nom || "",
    nomNaissance: c?.nomNaissance || c?.nom || "",
    prenom: c?.prenom || "",
    autresPrenoms: c?.autresPrenoms || "",
    genre:
      c?.sexe === "Homme"
        ? "MASCULIN"
        : c?.sexe === "Femme"
          ? "FEMININ"
          : "AUTRE",
    dateNaissance: convertDateToInputFormat(c?.dateNaissance || ""),
    villeNaissance: c?.lieuNaissance || "",
    departementNaissance: c?.departementNaissance || "",
    paysNaissance: c?.paysNaissance || "",
    nationalites: c?.nationalites || "",
    numeroSecuriteSociale: c?.numeroSecuriteSociale || "",
  };
};

const convertDateToInputFormat = (dateStr: string): string => {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const [day, month, year] = parts;
      if (day && month && year) {
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      }
    }
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }
    return "";
  } catch {
    return "";
  }
};

const hasChanges = computed(() => {
  const c = props.patient.conjoint;
  const original = {
    nomUsage: c?.nom || "",
    nomNaissance: c?.nomNaissance || c?.nom || "",
    prenom: c?.prenom || "",
    autresPrenoms: c?.autresPrenoms || "",
    genre:
      c?.sexe === "Homme"
        ? "MASCULIN"
        : c?.sexe === "Femme"
          ? "FEMININ"
          : "AUTRE",
    dateNaissance: convertDateToInputFormat(c?.dateNaissance || ""),
    villeNaissance: c?.lieuNaissance || "",
    departementNaissance: c?.departementNaissance || "",
    paysNaissance: c?.paysNaissance || "",
    nationalites: c?.nationalites || "",
    numeroSecuriteSociale: c?.numeroSecuriteSociale || "",
  };

  return Object.keys(original).some((key) => {
    const k = key as keyof typeof original;
    return original[k] !== editedConjoint.value[k];
  });
});

const emit = defineEmits<{
  save: [changes: Record<string, any>];
}>();

const startEditing = () => {
  initializeEditedConjoint();
  isEditing.value = true;
};

const cancelEditing = () => {
  isEditing.value = false;
};

const handleSave = () => {
  const c = props.patient.conjoint;
  const original = {
    nomUsage: c?.nom || "",
    nomNaissance: c?.nomNaissance || c?.nom || "",
    prenom: c?.prenom || "",
    autresPrenoms: c?.autresPrenoms || "",
    genre:
      c?.sexe === "Homme"
        ? "MASCULIN"
        : c?.sexe === "Femme"
          ? "FEMININ"
          : "AUTRE",
    dateNaissance: convertDateToInputFormat(c?.dateNaissance || ""),
    villeNaissance: c?.lieuNaissance || "",
    departementNaissance: c?.departementNaissance || "",
    paysNaissance: c?.paysNaissance || "",
    nationalites: c?.nationalites || "",
    numeroSecuriteSociale: c?.numeroSecuriteSociale || "",
  };

  const changes: Record<string, any> = {};
  Object.keys(original).forEach((key) => {
    const k = key as keyof typeof original;
    if (original[k] !== editedConjoint.value[k]) {
      changes[k] = editedConjoint.value[k];
    }
  });

  emit("save", changes);
  isEditing.value = false;
};
</script>
