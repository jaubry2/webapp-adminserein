<template>
  <div class="relative">
    <button
      type="button"
      @click="toggleDropdown"
      class="relative inline-flex items-center justify-center rounded-full p-2 hover:bg-gray-100 transition-colors"
      :class="isOpen ? 'bg-gray-100' : ''"
      title="Notifications"
    >
      <UIcon name="i-lucide-bell" class="h-5 w-5 secondary--text--color" />
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white"
      >
        {{ unreadCount > 99 ? "99+" : unreadCount }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  unreadCount: number;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  "update:isOpen": [value: boolean];
  "toggle": [];
}>();

const toggleDropdown = () => {
  emit("toggle");
  emit("update:isOpen", !props.isOpen);
};
</script>
