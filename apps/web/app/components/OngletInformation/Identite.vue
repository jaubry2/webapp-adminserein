<template>
  <div class="rounded-lg border border-gray-200 bg-white">
    <div
      class="flex w-full items-center justify-between border-b border-gray-200 px-6 py-4"
    >
      <button
        type="button"
        @click="identiteExpanded = !identiteExpanded"
        class="flex-1 text-left cursor-pointer"
      >
        <h2 class="text-lg font-semibold secondary--text--color">Identité</h2>
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
          @click="identiteExpanded = !identiteExpanded"
          class="cursor-pointer ml-2"
        >
          <UIcon
            :name="identiteExpanded ? 'i-lucide-minus' : 'i-lucide-plus'"
            class="h-5 w-5 quaternary--text--color"
          />
        </button>
      </div>
    </div>
    <div v-if="identiteExpanded" class="p-6">
      <div class="grid grid-cols-2 gap-6">
        <!-- Colonne gauche -->
        <div class="space-y-4">
          <div>
            <span class="text-sm quaternary--text--color">Nom :</span>
            <p
              v-if="!isEditing"
              class="mt-1 font-semibold secondary--text--color"
            >
              {{ patient.nom || "Non renseigné" }}
            </p>
            <input
              v-else
              v-model="editedData.nomUsage"
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
              {{ patient.prenom || "Non renseigné" }}
            </p>
            <input
              v-else
              v-model="editedData.prenom"
              type="text"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm input-focus-primary"
            />
          </div>
          <div>
            <span class="text-sm quaternary--text--color">Sexe :</span>
            <p
              v-if="!isEditing"
              class="mt-1 font-semibold secondary--text--color"
            >
              {{ patient.sexe || "Non renseigné" }}
            </p>
            <select
              v-else
              v-model="editedData.genre"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm input-focus-primary"
            >
              <option value="MASCULIN">Masculin</option>
              <option value="FEMININ">Féminin</option>
              <option value="AUTRE">Autre</option>
            </select>
          </div>
          <div>
            <span class="text-sm quaternary--text--color"
              >Lieu de naissance :</span
            >
            <p
              v-if="!isEditing"
              class="mt-1 font-semibold secondary--text--color"
            >
              {{ patient.lieuNaissance || "Non renseigné" }}
            </p>
            <input
              v-else
              v-model="editedData.villeNaissance"
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
              {{ patient.paysNaissance || "Non renseigné" }}
            </p>
            <input
              v-else
              v-model="editedData.paysNaissance"
              type="text"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm input-focus-primary"
            />
          </div>
        </div>

        <!-- Colonne droite -->
        <div class="space-y-4">
          <div>
            <span class="text-sm quaternary--text--color"
              >Nom de naissance :</span
            >
            <p
              v-if="!isEditing"
              class="mt-1 font-semibold secondary--text--color"
            >
              {{ patient.nomNaissance || patient.nom }}
            </p>
            <input
              v-else
              v-model="editedData.nomNaissance"
              type="text"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm input-focus-primary"
            />
          </div>
          <div>
            <span class="text-sm quaternary--text--color"
              >Autres prénoms :</span
            >
            <p
              v-if="!isEditing"
              class="mt-1 font-semibold secondary--text--color"
            >
              {{ patient.autresPrenoms || "Aucun" }}
            </p>
            <input
              v-else
              v-model="editedData.autresPrenoms"
              type="text"
              placeholder="Séparés par des virgules"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm input-focus-primary"
            />
          </div>
          <div>
            <span class="text-sm quaternary--text--color"
              >Date de naissance :</span
            >
            <p
              v-if="!isEditing"
              class="mt-1 font-semibold secondary--text--color"
            >
              {{ patient.dateNaissance }}
            </p>
            <input
              v-else
              v-model="editedData.dateNaissance"
              type="date"
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
              {{ patient.departementNaissance || "Non renseigné" }}
            </p>
            <input
              v-else
              v-model="editedData.departementNaissance"
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
              {{ patient.nationalites || "Non renseigné" }}
            </p>
            <input
              v-else
              v-model="editedData.nationalites"
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
              {{ patient.numeroSecuriteSociale || "Non renseigné" }}
            </p>
            <input
              v-else
              v-model="editedData.numeroSecuriteSociale"
              type="text"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm input-focus-primary"
            />
          </div>
          <div>
            <span class="text-sm quaternary--text--color"
              >Situation familiale :</span
            >
            <p
              v-if="!isEditing"
              class="mt-1 font-semibold secondary--text--color"
            >
              {{ patient.situationFamiliale || "Non renseigné" }}
            </p>
            <select
              v-else
              v-model="editedData.situationFamiliale"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm input-focus-primary"
            >
              <option value="CELIBATAIRE">Célibataire</option>
              <option value="MARIE">Marié(e)</option>
              <option value="DIVORCE">Divorcé(e)</option>
              <option value="VEUF">Veuf(ve)</option>
              <option value="PACSE">Pacsé(e)</option>
              <option value="CONCUBINAGE">Concubinage</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Patient } from "~/types/patient";

const props = defineProps<{
  patient: Patient;
  isEditing?: boolean;
  onSave?: (changes: Record<string, any>) => void;
}>();

const emit = defineEmits<{
  "update:isEditing": [value: boolean];
  changes: [changes: Record<string, any>];
}>();

const identiteExpanded = ref(true);
const isEditing = ref(props.isEditing || false);

// Données éditées
const editedData = ref({
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
  situationFamiliale: "CELIBATAIRE" as
    | "CELIBATAIRE"
    | "MARIE"
    | "DIVORCE"
    | "VEUF"
    | "PACSE"
    | "CONCUBINAGE",
});

// Initialiser les données éditées depuis le patient
const initializeEditedData = () => {
  editedData.value = {
    nomUsage: props.patient.nom || "",
    nomNaissance: props.patient.nomNaissance || props.patient.nom || "",
    prenom: props.patient.prenom || "",
    autresPrenoms: props.patient.autresPrenoms || "",
    genre:
      props.patient.sexe === "Homme"
        ? "MASCULIN"
        : props.patient.sexe === "Femme"
          ? "FEMININ"
          : "AUTRE",
    dateNaissance: convertDateToInputFormat(props.patient.dateNaissance),
    villeNaissance: props.patient.lieuNaissance || "",
    departementNaissance: props.patient.departementNaissance || "",
    paysNaissance: props.patient.paysNaissance || "",
    nationalites: props.patient.nationalites || "",
    numeroSecuriteSociale: props.patient.numeroSecuriteSociale || "",
    situationFamiliale: (props.patient.situationFamiliale || "CELIBATAIRE") as
      | "CELIBATAIRE"
      | "MARIE"
      | "DIVORCE"
      | "VEUF"
      | "PACSE"
      | "CONCUBINAGE",
  };
};

// Convertir la date au format input date (YYYY-MM-DD)
const convertDateToInputFormat = (dateStr: string): string => {
  if (!dateStr) return "";
  try {
    // Essayer le format français DD/MM/YYYY d'abord
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const [day, month, year] = parts;
      if (day && month && year) {
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      }
    }
    // Sinon essayer de parser comme Date ISO
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }
    return "";
  } catch {
    return "";
  }
};

// Détecter les changements
const hasChanges = computed(() => {
  const original = {
    nomUsage: props.patient.nom || "",
    nomNaissance: props.patient.nomNaissance || props.patient.nom || "",
    prenom: props.patient.prenom || "",
    autresPrenoms: props.patient.autresPrenoms || "",
    genre:
      props.patient.sexe === "Homme"
        ? "MASCULIN"
        : props.patient.sexe === "Femme"
          ? "FEMININ"
          : "AUTRE",
    dateNaissance: convertDateToInputFormat(props.patient.dateNaissance),
    villeNaissance: props.patient.lieuNaissance || "",
    departementNaissance: props.patient.departementNaissance || "",
    paysNaissance: props.patient.paysNaissance || "",
    nationalites: props.patient.nationalites || "",
    numeroSecuriteSociale: props.patient.numeroSecuriteSociale || "",
    situationFamiliale: props.patient.situationFamiliale || "CELIBATAIRE",
  };

  return Object.keys(original).some((key) => {
    const k = key as keyof typeof original;
    return original[k] !== editedData.value[k];
  });
});

// Démarrer l'édition
const startEditing = () => {
  initializeEditedData();
  isEditing.value = true;
  emit("update:isEditing", true);
};

// Annuler l'édition
const cancelEditing = () => {
  isEditing.value = false;
  emit("update:isEditing", false);
};

// Sauvegarder
const handleSave = () => {
  if (props.onSave) {
    const changes: Record<string, any> = {};

    // Comparer chaque champ et construire l'objet de changements
    const original = {
      nomUsage: props.patient.nom || "",
      nomNaissance: props.patient.nomNaissance || props.patient.nom || "",
      prenom: props.patient.prenom || "",
      autresPrenoms: props.patient.autresPrenoms || "",
      genre:
        props.patient.sexe === "Homme"
          ? "MASCULIN"
          : props.patient.sexe === "Femme"
            ? "FEMININ"
            : "AUTRE",
      dateNaissance: convertDateToInputFormat(props.patient.dateNaissance),
      villeNaissance: props.patient.lieuNaissance || "",
      departementNaissance: props.patient.departementNaissance || "",
      paysNaissance: props.patient.paysNaissance || "",
      nationalites: props.patient.nationalites || "",
      numeroSecuriteSociale: props.patient.numeroSecuriteSociale || "",
      situationFamiliale: props.patient.situationFamiliale || "CELIBATAIRE",
    };

    Object.keys(original).forEach((key) => {
      const k = key as keyof typeof original;
      if (original[k] !== editedData.value[k]) {
        changes[k] = editedData.value[k];
      }
    });

    props.onSave(changes);
  }
  emit("changes", editedData.value);
};

// Synchroniser avec les props
watch(
  () => props.isEditing,
  (newVal) => {
    isEditing.value = newVal || false;
    if (newVal) {
      initializeEditedData();
    }
  },
);

watch(
  () => props.patient,
  () => {
    if (!isEditing.value) {
      initializeEditedData();
    }
  },
  { deep: true },
);
</script>

<style></style>
