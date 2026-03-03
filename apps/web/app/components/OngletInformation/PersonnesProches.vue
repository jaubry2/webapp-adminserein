<template>
  <div class="rounded-lg border border-gray-200 bg-white">
    <div
      class="flex w-full items-center justify-between border-b border-gray-200 px-6 py-4"
    >
      <button
        type="button"
        @click="isExpanded = !isExpanded"
        class="flex-1 text-left cursor-pointer"
      >
        <h2 class="text-lg font-semibold secondary--text--color">
          Personnes proches
        </h2>
      </button>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium secondary--text--color transition-colors hover:bg-gray-50"
          @click="startAdd"
        >
          <UIcon name="i-lucide-plus" class="h-4 w-4" />
          Ajouter une personne
        </button>
        <button
          type="button"
          class="cursor-pointer ml-2"
          @click="isExpanded = !isExpanded"
        >
          <UIcon
            :name="isExpanded ? 'i-lucide-minus' : 'i-lucide-plus'"
            class="h-5 w-5 quaternary--text--color"
          />
        </button>
      </div>
    </div>

    <div v-if="isExpanded" class="p-6 space-y-4">
      <div v-if="isLoading" class="text-sm quaternary--text--color">
        Chargement des personnes proches...
      </div>
      <div v-else-if="isError" class="text-sm text-red-500">
        Erreur lors du chargement des personnes proches.
      </div>
      <div
        v-else-if="!personnesProches || personnesProches.length === 0"
        class="text-sm quaternary--text--color"
      >
        Aucune personne proche renseignée.
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="(p, index) in personnesProches"
          :key="p.id"
          class="flex items-start justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 gap-4"
        >
          <div class="flex-1 space-y-1">
            <div class="flex items-center gap-2">
              <span class="font-medium secondary--text--color">
                {{ p.prenom }} {{ p.nomUsage }}
              </span>
              <span
                class="text-xs px-2 py-0.5 rounded-full bg-gray-100 quaternary--text--color"
              >
                {{ p.lien }}
              </span>
            </div>
            <p class="text-xs quaternary--text--color">
              {{ p.adresse }}, {{ p.codePostal }} {{ p.ville }}
            </p>
            <p class="text-xs quaternary--text--color">
              Tél : {{ p.telephone }} • Mail : {{ p.mail }}
            </p>
          </div>
          <div class="flex flex-col items-end gap-2">
            <div class="flex gap-1">
              <button
                type="button"
                class="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white p-1 text-gray-500 hover:bg-gray-100"
                :disabled="index === 0"
                @click="$emit('reorder', { id: p.id, direction: 'up' })"
              >
                <UIcon name="i-lucide-arrow-up" class="h-4 w-4" />
              </button>
              <button
                type="button"
                class="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white p-1 text-gray-500 hover:bg-gray-100"
                :disabled="index === personnesProches.length - 1"
                @click="$emit('reorder', { id: p.id, direction: 'down' })"
              >
                <UIcon name="i-lucide-arrow-down" class="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              class="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs font-medium secondary--text--color transition-colors hover:bg-gray-50"
              @click="startEdit(p)"
            >
              <UIcon name="i-lucide-pencil" class="h-3 w-3" />
              Modifier
            </button>
          </div>
        </div>
      </div>

      <!-- Formulaire ajout / édition -->
      <div
        v-if="isEditing"
        class="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3"
      >
        <h3 class="text-sm font-semibold secondary--text--color">
          {{
            editingId
              ? "Modifier une personne proche"
              : "Ajouter une personne proche"
          }}
        </h3>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs quaternary--text--color mb-1"
              >Nom d'usage</label
            >
            <input
              v-model="form.nomUsage"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm input-focus-primary"
            />
          </div>
          <div>
            <label class="block text-xs quaternary--text--color mb-1"
              >Nom de naissance</label
            >
            <input
              v-model="form.nomNaissance"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm input-focus-primary"
            />
          </div>
          <div>
            <label class="block text-xs quaternary--text--color mb-1"
              >Prénom</label
            >
            <input
              v-model="form.prenom"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm input-focus-primary"
            />
          </div>
          <div>
            <label class="block text-xs quaternary--text--color mb-1"
              >Autres prénoms</label
            >
            <input
              v-model="form.autresPrenoms"
              type="text"
              placeholder="Séparés par des virgules"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm input-focus-primary"
            />
          </div>
          <div>
            <label class="block text-xs quaternary--text--color mb-1"
              >Genre</label
            >
            <select
              v-model="form.genre"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm input-focus-primary"
            >
              <option value="MASCULIN">Masculin</option>
              <option value="FEMININ">Féminin</option>
              <option value="AUTRE">Autre</option>
            </select>
          </div>
          <div>
            <label class="block text-xs quaternary--text--color mb-1"
              >Lien</label
            >
            <input
              v-model="form.lien"
              type="text"
              placeholder="Conjoint, enfant, voisin..."
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm input-focus-primary"
            />
          </div>
          <div class="col-span-2">
            <label class="block text-xs quaternary--text--color mb-1"
              >Adresse</label
            >
            <input
              v-model="form.adresse"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm input-focus-primary"
            />
          </div>
          <div>
            <label class="block text-xs quaternary--text--color mb-1"
              >Code postal</label
            >
            <input
              v-model="form.codePostal"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm input-focus-primary"
            />
          </div>
          <div>
            <label class="block text-xs quaternary--text--color mb-1"
              >Ville</label
            >
            <input
              v-model="form.ville"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm input-focus-primary"
            />
          </div>
          <div>
            <label class="block text-xs quaternary--text--color mb-1"
              >Téléphone</label
            >
            <input
              v-model="form.telephone"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm input-focus-primary"
            />
          </div>
          <div>
            <label class="block text-xs quaternary--text--color mb-1"
              >Mail</label
            >
            <input
              v-model="form.mail"
              type="email"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm input-focus-primary"
            />
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button
            type="button"
            class="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium secondary--text--color transition-colors hover:bg-gray-50"
            @click="cancelEdit"
          >
            Annuler
          </button>
          <button
            type="button"
            class="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-[var(--primary-color)] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:opacity-90"
            @click="submitForm"
          >
            <UIcon name="i-lucide-check" class="h-4 w-4" />
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PersonneProche } from "~/types/patient";

const props = defineProps<{
  personnesProches?: PersonneProche[];
  isLoading?: boolean;
  isError?: boolean;
}>();

const emit = defineEmits<{
  create: [payload: Omit<PersonneProche, "id" | "ordre">];
  update: [
    payload: { id: string } & Partial<Omit<PersonneProche, "id" | "ordre">>,
  ];
  reorder: [payload: { id: string; direction: "up" | "down" }];
}>();
const isExpanded = ref(true);

const isEditing = ref(false);
const editingId = ref<string | null>(null);

const form = ref({
  genre: "AUTRE" as "MASCULIN" | "FEMININ" | "AUTRE",
  nomUsage: "",
  nomNaissance: "",
  prenom: "",
  autresPrenoms: "",
  adresse: "",
  codePostal: "",
  ville: "",
  telephone: "",
  mail: "",
  lien: "",
});

const resetForm = () => {
  form.value = {
    genre: "AUTRE",
    nomUsage: "",
    nomNaissance: "",
    prenom: "",
    autresPrenoms: "",
    adresse: "",
    codePostal: "",
    ville: "",
    telephone: "",
    mail: "",
    lien: "",
  };
};

const startAdd = () => {
  editingId.value = null;
  resetForm();
  isEditing.value = true;
};

const startEdit = (p: PersonneProche) => {
  editingId.value = p.id;
  form.value = {
    genre: p.genre,
    nomUsage: p.nomUsage,
    nomNaissance: p.nomNaissance,
    prenom: p.prenom,
    autresPrenoms: p.autresPrenoms || "",
    adresse: p.adresse,
    codePostal: p.codePostal,
    ville: p.ville,
    telephone: p.telephone,
    mail: p.mail,
    lien: p.lien,
  };
  isEditing.value = true;
};

const cancelEdit = () => {
  isEditing.value = false;
  editingId.value = null;
};

const submitForm = () => {
  const payload = {
    genre: form.value.genre,
    nomUsage: form.value.nomUsage,
    nomNaissance: form.value.nomNaissance,
    prenom: form.value.prenom,
    autresPrenoms: form.value.autresPrenoms
      ? form.value.autresPrenoms
          .split(",")
          .map((p) => p.trim())
          .filter((p) => p.length > 0)
      : [],
    adresse: form.value.adresse,
    codePostal: form.value.codePostal,
    ville: form.value.ville,
    telephone: form.value.telephone,
    mail: form.value.mail,
    lien: form.value.lien,
  };

  if (editingId.value) {
    emit("update", {
      id: editingId.value,
      ...payload,
    });
  } else {
    emit("create", payload);
  }

  isEditing.value = false;
  editingId.value = null;
};
</script>
