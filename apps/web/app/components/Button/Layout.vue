<template>
  <button
    type="button"
    class="flex w-full items-center gap-3 rounded-full px-3 py-2.5 shadow-sm hover:bg-white transition"
  >
    <span class="flex h-10 w-10 items-center justify-center rounded-full">
      <UIcon :name="props.icon" class="h-4 w-4 text-slate-700" />
    </span>
    <span>{{ props.label }}</span>
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    icon: string;
    label: string;
  }>(),
  {
    icon: "i-lucide-users",
  }
);
</script>
