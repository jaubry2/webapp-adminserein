<template>
  <!-- Overlay avec blur (tout sauf la sidebar à gauche) -->
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
      >
        <!-- Overlay avec blur : à droite de la sidebar (w-64 = 256px), clics actifs pour fermer -->
        <div
          class="pointer-events-auto absolute top-0 right-0 bottom-0 left-64 bg-white/30 backdrop-blur-sm"
          @click="closeModal"
        ></div>

        <!-- Modal : clics actifs, bordure secondary -->
        <div
          class="pointer-events-auto relative z-10 w-full max-w-lg rounded-lg border-2 tertiary--background--color secondary--border--color shadow-xl"
          @click.stop
        >
          <!-- En-tête du modal -->
          <div
            class="flex items-center justify-between border-b border-gray-200 px-6 py-4"
          >
            <h2
              class="text-xl font-semibold secondary--text--color font--title"
            >
              Ajouter un nouveau patient
            </h2>
            <button
              @click="closeModal"
              class="text-red-500 hover:text-red-700 transition-colors"
              type="button"
            >
              <UIcon name="i-lucide-x" class="h-6 w-6" />
            </button>
          </div>

          <!-- Contenu du modal -->
          <div class="px-6 py-6">
            <!-- Première question -->
            <div class="mb-6">
              <label
                class="mb-3 block text-sm font-medium secondary--text--color"
              >
                Vous connaissez le numéro de dossier :
              </label>
              <div class="flex gap-2">
                <button
                  @click="connaitDossierNumber = true"
                  type="button"
                  class="flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
                  :class="
                    connaitDossierNumber
                      ? 'border-[#2e3a45] text-[#2e3a45] bg-[#a7c7e7]'
                      : 'border-gray-300 bg-white text-gray-700 tertiary--background--color'
                  "
                  :style="
                    connaitDossierNumber
                      ? {
                          backgroundColor: 'rgba(167, 199, 231, 0.1)',
                        }
                      : {}
                  "
                >
                  Oui
                </button>
                <button
                  @click="connaitDossierNumber = false"
                  type="button"
                  class="flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
                  :class="
                    !connaitDossierNumber
                      ? 'border-[#2e3a45] text-[#2e3a45] bg-[#a7c7e7]'
                      : 'border-gray-300 bg-white text-gray-700 tertiary--background--color'
                  "
                  :style="
                    !connaitDossierNumber
                      ? {
                          backgroundColor: 'rgba(167, 199, 231, 0.1)',
                        }
                      : {}
                  "
                >
                  Non
                </button>
              </div>
            </div>

            <!-- Champ numéro de dossier (si Oui) -->
            <div v-if="connaitDossierNumber" class="mb-6">
              <label
                for="dossier-number"
                class="mb-2 block text-sm font-medium secondary--text--color"
              >
                Numéro de dossier du patient :
              </label>
              <input
                id="dossier-number"
                v-model="formData.dossierNumber"
                type="text"
                placeholder="Entrez le numéro de dossier"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 input-focus-primary"
              />
            </div>

            <!-- Séparateur -->
            <div
              v-if="!connaitDossierNumber"
              class="mb-6 border-t border-gray-200"
            ></div>

            <!-- Deuxième question (si Non à la première) -->
            <div v-if="!connaitDossierNumber" class="mb-6">
              <label
                class="mb-3 block text-sm font-medium secondary--text--color"
              >
                Le patient a un dossier :
              </label>
              <div class="flex gap-2">
                <button
                  @click="patientADossier = 'oui'"
                  type="button"
                  class="flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
                  :class="
                    patientADossier === 'oui'
                      ? 'primary--border--color primary--text--color'
                      : 'border-gray-300 bg-white text-gray-700 tertiary--background--color'
                  "
                  :style="
                    patientADossier === 'oui'
                      ? {
                          backgroundColor: 'rgba(167, 199, 231, 0.1)',
                        }
                      : {}
                  "
                >
                  Oui
                </button>
                <button
                  @click="patientADossier = 'je-sais-pas'"
                  type="button"
                  class="flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
                  :class="
                    patientADossier === 'je-sais-pas'
                      ? 'primary--border--color primary--text--color'
                      : 'border-gray-300 bg-white text-gray-700 tertiary--background--color'
                  "
                  :style="
                    patientADossier === 'je-sais-pas'
                      ? {
                          backgroundColor: 'rgba(167, 199, 231, 0.1)',
                        }
                      : {}
                  "
                >
                  Je sais pas
                </button>
                <button
                  @click="patientADossier = 'non'"
                  type="button"
                  class="flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
                  :class="
                    patientADossier === 'non'
                      ? 'primary--border--color primary--text--color'
                      : 'border-gray-300 bg-white text-gray-700 tertiary--background--color'
                  "
                  :style="
                    patientADossier === 'non'
                      ? {
                          backgroundColor: 'rgba(167, 199, 231, 0.1)',
                        }
                      : {}
                  "
                >
                  Non
                </button>
              </div>
            </div>

            <!-- Champs de formulaire (si Non à la première question) -->
            <div v-if="!connaitDossierNumber" class="space-y-4">
              <div>
                <label
                  for="nom"
                  class="mb-2 block text-sm font-medium secondary--text--color"
                >
                  Nom :
                </label>
                <input
                  id="nom"
                  v-model="formData.nom"
                  type="text"
                  placeholder="Entrez le nom"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 input-focus-primary"
                />
              </div>

              <div>
                <label
                  for="prenom"
                  class="mb-2 block text-sm font-medium secondary--text--color"
                >
                  Prénom :
                </label>
                <input
                  id="prenom"
                  v-model="formData.prenom"
                  type="text"
                  placeholder="Entrez le prénom"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 input-focus-primary"
                />
              </div>

              <div>
                <label
                  for="date-naissance"
                  class="mb-2 block text-sm font-medium secondary--text--color"
                >
                  Date de naissance :
                </label>
                <input
                  id="date-naissance"
                  v-model="formData.dateNaissance"
                  type="text"
                  placeholder="JJ/MM/AAAA"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 input-focus-primary"
                />
              </div>
            </div>
          </div>

          <!-- Bouton de validation -->
          <div class="border-t border-gray-200 px-6 py-4">
            <button
              @click="handleSubmit"
              type="button"
              class="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
              style="background-color: var(--primary-color)"
            >
              Valider
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  close: [];
  submit: [
    data: {
      dossierNumber?: string;
      nom?: string;
      prenom?: string;
      dateNaissance?: string;
      connaitDossierNumber: boolean;
      patientADossier?: "oui" | "je-sais-pas" | "non";
    }
  ];
}>();

const connaitDossierNumber = ref(true);
const patientADossier = ref<"oui" | "je-sais-pas" | "non">("non");

const formData = ref({
  dossierNumber: "",
  nom: "",
  prenom: "",
  dateNaissance: "",
});

const closeModal = () => {
  emit("close");
  // Reset form
  connaitDossierNumber.value = true;
  patientADossier.value = "non";
  formData.value = {
    dossierNumber: "",
    nom: "",
    prenom: "",
    dateNaissance: "",
  };
};

const handleSubmit = () => {
  emit("submit", {
    dossierNumber: formData.value.dossierNumber,
    nom: formData.value.nom,
    prenom: formData.value.prenom,
    dateNaissance: formData.value.dateNaissance,
    connaitDossierNumber: connaitDossierNumber.value,
    patientADossier: patientADossier.value,
  });
  closeModal();
};
</script>

<style scoped>
/* Animation d'entrée/sortie du modal */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  opacity: 0;
  transform: scale(0.95);
}
</style>
