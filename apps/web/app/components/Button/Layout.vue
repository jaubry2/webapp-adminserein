<template>
  <NuxtLink
    :to="props.to"
    class="flex w-full items-center gap-3 rounded-full px-3 py-2.5 transition-transform hover:scale-110 duration-300 hover:shadow-sm"
    :class="
      isActive
        ? 'border secondary--border--color'
        : 'primary--background--color hover:primary--background--color/40'
    "
  >
    <span class="flex h-10 w-10 items-center justify-center rounded-full">
      <UIcon
        :name="props.icon"
        class="text-slate-700"
        :class="isActive ? 'h-6 w-6' : 'h-4 w-4'"
      />
    </span>
    <span class="transition" :class="isActive ? 'font-bold text-lg ' : ''">{{
      props.label
    }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
const route = useRoute();

const props = defineProps({
  icon: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
});
const isActive = computed(() => {
  return route.path === props.to;
});
</script>
