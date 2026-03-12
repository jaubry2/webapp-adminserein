<script setup lang="ts">
import { computed } from "vue";
import DemandesSelector from "~/components/NouvelleDemandeSelector.vue";

const props = defineProps<{
  modelValue: boolean;
  patientId?: string | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val),
});

function close() {
  isOpen.value = false;
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    @click.self="close"
  >
    <section
      class="relative w-full max-w-6xl rounded-md border secondary--border--color bg-tertiary px-10 py-10 shadow-sm tertiary--background--color"
    >
      <header class="mb-10 flex items-center justify-between">
        <h2
          class="text-3xl font-semibold secondary--text--color font--title text-center flex-1"
        >
          Nouvelle demande
        </h2>
        <button
          type="button"
          class="ml-4 text-xs quaternary--text--color hover:text-gray-700"
          @click="close"
        >
          Fermer
        </button>
      </header>

      <DemandesSelector :patient-id="patientId ?? null" />
    </section>
  </div>
</template>
