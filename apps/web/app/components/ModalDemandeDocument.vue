<template>
  <Teleport to="body">
    <Transition name="fade-scale">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div
          class="absolute inset-0 bg-black/30 backdrop-blur-sm"
          @click="emitCancel"
        />

        <div
          class="relative z-10 w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-xl flex flex-col"
          @click.stop
        >
          <header
            class="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-4"
          >
            <div class="space-y-1">
              <h2 class="text-lg font-semibold secondary--text--color font--title">
                Demander un document
              </h2>
              <p class="text-xs quaternary--text--color">
                Indiquez le nom et la catégorie du document que vous souhaitez que le
                patient dépose.
              </p>
            </div>
            <button
              type="button"
              class="text-gray-400 hover:text-gray-600 transition-colors"
              @click="emitCancel"
            >
              <UIcon name="i-lucide-x" class="h-5 w-5" />
            </button>
          </header>

          <div class="px-6 py-4 space-y-3">
            <div class="space-y-1">
              <label class="block text-xs font-medium quaternary--text--color">
                Nom du document demandé
              </label>
              <input
                v-model="localNom"
                type="text"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                placeholder="Ex : Relevé de compte janvier 2026, Bail de location signé..."
                @keyup.enter="handleConfirm"
              />
            </div>

            <div class="space-y-1">
              <label class="block text-xs font-medium quaternary--text--color">
                Catégorie du document
              </label>
              <select
                v-model="localCategorie"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent bg-white"
              >
                <option disabled value="">Sélectionner une catégorie</option>
                <option value="IDENTITE">Identité</option>
                <option value="MEDICAL">Médical</option>
                <option value="ADMINISTRATIF">Administratif</option>
                <option value="FINANCIER">Financier</option>
                <option value="JURIDIQUE">Juridique</option>
                <option value="LOGEMENT">Logement</option>
                <option value="EMPLOI">Emploi</option>
                <option value="AUTRE">Autre</option>
              </select>
            </div>

            <p class="text-[11px] quaternary--text--color">
              Ces informations seront visibles par le patient dans sa notification
              et dans la description de la tâche.
            </p>
          </div>

          <footer
            class="flex items-center justify-end gap-2 border-t border-gray-200 px-6 py-3"
          >
            <UButton
              color="gray"
              variant="ghost"
              size="sm"
              class="rounded-full"
              @click="emitCancel"
            >
              Annuler
            </UButton>
            <UButton
              color="gray"
              size="sm"
              class="rounded-full"
              :disabled="!localNom.trim() || !localCategorie"
              @click="handleConfirm"
            >
              Envoyer la demande
            </UButton>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  confirm: [payload: { nomDocument: string; categorie: string }];
  cancel: [];
}>();

const localNom = ref("");
const localCategorie = ref<string>("");

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      localNom.value = "";
      localCategorie.value = "";
    }
  },
);

const handleConfirm = () => {
  if (!localNom.value.trim() || !localCategorie.value) return;
  emit("confirm", {
    nomDocument: localNom.value.trim(),
    categorie: localCategorie.value,
  });
};

const emitCancel = () => {
  emit("cancel");
};
</script>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.97);
}
</style>

