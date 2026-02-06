<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
      >
        <!-- Overlay -->
        <div
          class="pointer-events-auto absolute inset-0 bg-black/30 backdrop-blur-sm"
          @click="handleCancel"
        ></div>

        <!-- Modal -->
        <div
          class="pointer-events-auto relative z-10 w-full max-w-2xl max-h-[90vh] rounded-lg border-2 tertiary--background--color secondary--border--color shadow-xl flex flex-col"
          @click.stop
        >
          <!-- En-tête -->
          <div
            class="flex items-center justify-between border-b border-gray-200 px-6 py-4"
          >
            <h2
              class="text-xl font-semibold secondary--text--color font--title"
            >
              Résumé des modifications
            </h2>
            <button
              @click="handleCancel"
              class="text-red-500 hover:text-red-700 transition-colors cursor-pointer"
              type="button"
            >
              <UIcon name="i-lucide-x" class="h-6 w-6" />
            </button>
          </div>

          <!-- Contenu -->
          <div class="px-6 py-6 overflow-y-auto flex-1">
            <div v-if="changes.length === 0" class="text-center py-8">
              <p class="text-sm quaternary--text--color">
                Aucune modification détectée
              </p>
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="(change, index) in changes"
                :key="index"
                class="border-b border-gray-100 pb-3 last:border-0"
              >
                <div class="flex items-start gap-3">
                  <div class="flex-1">
                    <p class="text-sm font-medium secondary--text--color mb-1">
                      {{ change.label }}
                    </p>
                    <div class="flex items-center gap-2 text-sm">
                      <span class="text-gray-500 line-through">
                        {{ change.oldValue || "Non renseigné" }}
                      </span>
                      <UIcon
                        name="i-lucide-arrow-right"
                        class="h-4 w-4 text-gray-400"
                      />
                      <span class="font-semibold secondary--text--color">
                        {{ change.newValue || "Non renseigné" }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div
            class="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end"
          >
            <button
              @click="handleCancel"
              type="button"
              class="cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              @click="handleConfirm"
              type="button"
              :disabled="isLoading || changes.length === 0"
              class="cursor-pointer px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style="background-color: var(--primary-color)"
            >
              <span v-if="isLoading">Enregistrement...</span>
              <span v-else>Confirmer</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
export interface Change {
  field: string;
  label: string;
  oldValue: string;
  newValue: string;
}

const props = defineProps<{
  isOpen: boolean;
  changes: Change[];
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

const handleConfirm = () => {
  if (props.changes.length > 0 && !props.isLoading) {
    emit("confirm");
  }
};

const handleCancel = () => {
  emit("cancel");
};
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
