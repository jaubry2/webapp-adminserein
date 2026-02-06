<template>
  <div class="rounded-lg border border-gray-200 bg-white">
    <div
      class="flex w-full items-center justify-between border-b border-gray-200 px-6 py-4"
    >
      <button
        type="button"
        @click="coordonneesExpanded = !coordonneesExpanded"
        class="flex-1 text-left cursor-pointer"
      >
        <h2 class="text-lg font-semibold secondary--text--color">
          Coordonnées
        </h2>
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
          @click="coordonneesExpanded = !coordonneesExpanded"
          class="ml-2"
        >
          <UIcon
            :name="coordonneesExpanded ? 'i-lucide-minus' : 'i-lucide-plus'"
            class="cursor-pointer h-5 w-5 quaternary--text--color"
          />
        </button>
      </div>
    </div>

    <div v-if="coordonneesExpanded" class="p-6">
      <div class="grid grid-cols-2 gap-6">
        <!-- Colonne gauche -->
        <div class="space-y-4">
          <div>
            <span class="text-sm quaternary--text--color"
              >Numéro de téléphone :</span
            >
            <p
              v-if="!isEditing"
              class="mt-1 font-semibold secondary--text--color"
            >
              {{ patient.telephone || "Non renseigné" }}
            </p>
            <input
              v-else
              v-model="editedData.numeroTelephone"
              type="tel"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm input-focus-primary"
            />
          </div>
          <div>
            <span class="text-sm quaternary--text--color">Adresse :</span>
            <p
              v-if="!isEditing"
              class="mt-1 font-semibold secondary--text--color"
            >
              {{ patient.adresse || "Non renseigné" }}
            </p>
            <input
              v-else
              v-model="editedData.adresse"
              type="text"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm input-focus-primary"
            />
          </div>
          <div>
            <span class="text-sm quaternary--text--color">Code postal :</span>
            <p
              v-if="!isEditing"
              class="mt-1 font-semibold secondary--text--color"
            >
              {{ patient.codePostal || "Non renseigné" }}
            </p>
            <input
              v-else
              v-model="editedData.codePostal"
              type="text"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm input-focus-primary"
            />
          </div>
          <div>
            <span class="text-sm quaternary--text--color">Ville :</span>
            <p
              v-if="!isEditing"
              class="mt-1 font-semibold secondary--text--color"
            >
              {{ patient.ville || "Non renseigné" }}
            </p>
            <input
              v-else
              v-model="editedData.ville"
              type="text"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm input-focus-primary"
            />
          </div>
        </div>
        <!-- Colonne droite -->
        <div class="space-y-4">
          <div>
            <span class="text-sm quaternary--text--color">Adresse mail :</span>
            <p
              v-if="!isEditing"
              class="mt-1 font-semibold secondary--text--color"
            >
              {{ patient.email || "Non renseigné" }}
            </p>
            <input
              v-else
              v-model="editedData.adresseMail"
              type="email"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm input-focus-primary"
            />
          </div>
          <div>
            <span class="text-sm quaternary--text--color"
              >Informations complémentaires :</span
            >
            <p
              v-if="!isEditing"
              class="mt-1 font-semibold secondary--text--color"
            >
              {{ patient.informationComplementaires || "Non renseigné" }}
            </p>
            <input
              v-else
              v-model="editedData.informationComplementaires"
              type="text"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm input-focus-primary"
            />
          </div>
          <div>
            <span class="text-sm quaternary--text--color">Département :</span>
            <p
              v-if="!isEditing"
              class="mt-1 font-semibold secondary--text--color"
            >
              {{ patient.departement || "Non renseigné" }}
            </p>
            <input
              v-else
              v-model="editedData.departement"
              type="text"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm input-focus-primary"
            />
          </div>
          <div>
            <span class="text-sm quaternary--text--color">Pays :</span>
            <p
              v-if="!isEditing"
              class="mt-1 font-semibold secondary--text--color"
            >
              {{ patient.pays || "Non renseigné" }}
            </p>
            <input
              v-else
              v-model="editedData.pays"
              type="text"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm input-focus-primary"
            />
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

const coordonneesExpanded = ref(true);
const isEditing = ref(props.isEditing || false);

// Données éditées
const editedData = ref({
  adresse: "",
  informationComplementaires: "",
  codePostal: "",
  ville: "",
  departement: "",
  pays: "",
  numeroTelephone: "",
  adresseMail: "",
});

// Initialiser les données éditées depuis le patient
const initializeEditedData = () => {
  editedData.value = {
    adresse: props.patient.adresse || "",
    informationComplementaires: props.patient.informationComplementaires || "",
    codePostal: props.patient.codePostal || "",
    ville: props.patient.ville || "",
    departement: props.patient.departement || "",
    pays: props.patient.pays || "",
    numeroTelephone: props.patient.telephone || "",
    adresseMail: props.patient.email || "",
  };
};

// Détecter les changements
const hasChanges = computed(() => {
  const original = {
    adresse: props.patient.adresse || "",
    informationComplementaires: props.patient.informationComplementaires || "",
    codePostal: props.patient.codePostal || "",
    ville: props.patient.ville || "",
    departement: props.patient.departement || "",
    pays: props.patient.pays || "",
    numeroTelephone: props.patient.telephone || "",
    adresseMail: props.patient.email || "",
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
      adresse: props.patient.adresse || "",
      informationComplementaires:
        props.patient.informationComplementaires || "",
      codePostal: props.patient.codePostal || "",
      ville: props.patient.ville || "",
      departement: props.patient.departement || "",
      pays: props.patient.pays || "",
      numeroTelephone: props.patient.telephone || "",
      adresseMail: props.patient.email || "",
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
