<template>
  <div>
    <!-- Bouton Ajouter un patient -->
    <button
      type="button"
      class="inline-flex items-center gap-2 rounded-md px-2 py-1 font-medium transition-colors"
      :style="{
        backgroundColor: `var(--${props.bg_color})`,
        color: `var(--${props.text_color})`,
      }"
    >
      <UIcon :name="props.icon" class="h-5 w-5" />
      <span class="text-xs font-medium">{{ props.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  icon: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  bg_color: {
    type: String,
    required: true,
  },
  text_color: {
    type: String,
    required: true,
  },
});
</script>

<style></style>
