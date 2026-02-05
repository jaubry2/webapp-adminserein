<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
      >
        <!-- Overlay avec blur -->
        <div
          class="pointer-events-auto absolute inset-0 bg-white/30 backdrop-blur-sm"
          @click="handleCancel"
        ></div>

        <!-- Modal -->
        <div
          class="pointer-events-auto relative z-10 w-full max-w-2xl rounded-lg border-2 tertiary--background--color secondary--border--color shadow-xl"
          @click.stop
        >
          <!-- En-tête du modal -->
          <div
            class="flex items-center justify-between border-b border-gray-200 px-6 py-4"
          >
            <h2
              class="text-xl font-semibold secondary--text--color font--title"
            >
              Confirmer le patient
            </h2>
            <button
              @click="handleCancel"
              class="text-red-500 hover:text-red-700 transition-colors"
              type="button"
            >
              <UIcon name="i-lucide-x" class="h-6 w-6" />
            </button>
          </div>

          <!-- Contenu du modal -->
          <div class="px-6 py-6">
            <p class="mb-4 text-sm text-gray-600">
              Un patient correspondant aux informations fournies a été trouvé.
              Veuillez vérifier les informations ci-dessous :
            </p>

            <!-- Informations du patient -->
            <div class="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-xs font-medium text-gray-500">
                    Numéro de dossier
                  </label>
                  <p class="text-sm font-semibold secondary--text--color">
                    {{ patient?.numeroDossier }}
                  </p>
                </div>

                <div>
                  <label class="text-xs font-medium text-gray-500">
                    Date de naissance
                  </label>
                  <p class="text-sm font-semibold secondary--text--color">
                    {{
                      patient?.informationIdentite?.dateNaissance
                        ? new Date(
                            patient.informationIdentite.dateNaissance
                          ).toLocaleDateString("fr-FR")
                        : ""
                    }}
                  </p>
                </div>

                <div>
                  <label class="text-xs font-medium text-gray-500">Nom</label>
                  <p class="text-sm font-semibold secondary--text--color">
                    {{ patient?.informationIdentite?.nomUsage }}
                  </p>
                </div>

                <div>
                  <label class="text-xs font-medium text-gray-500">Prénom</label>
                  <p class="text-sm font-semibold secondary--text--color">
                    {{ patient?.informationIdentite?.prenom }}
                  </p>
                </div>

                <div>
                  <label class="text-xs font-medium text-gray-500">
                    Nom de naissance
                  </label>
                  <p class="text-sm font-semibold secondary--text--color">
                    {{ patient?.informationIdentite?.nomNaissance }}
                  </p>
                </div>

                <div>
                  <label class="text-xs font-medium text-gray-500">Genre</label>
                  <p class="text-sm font-semibold secondary--text--color">
                    {{
                      patient?.informationIdentite?.genre === "MASCULIN"
                        ? "Masculin"
                        : patient?.informationIdentite?.genre === "FEMININ"
                          ? "Féminin"
                          : "Autre"
                    }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Boutons d'action -->
          <div class="border-t border-gray-200 px-6 py-4">
            <div class="flex gap-3">
              <button
                @click="handleCancel"
                type="button"
                class="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Non, ce n'est pas le bon
              </button>
              <button
                @click="handleConfirm"
                type="button"
                :disabled="isLoading"
                class="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style="background-color: var(--primary-color)"
              >
                <span v-if="isLoading">Ajout en cours...</span>
                <span v-else>Oui, c'est le bon</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean;
  patient: {
    id: string;
    numeroDossier: string;
    informationIdentite?: {
      nomUsage: string;
      nomNaissance: string;
      prenom: string;
      genre: string;
      dateNaissance: string | Date;
    };
  } | null;
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

const handleConfirm = () => {
  emit("confirm");
};

const handleCancel = () => {
  emit("cancel");
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
