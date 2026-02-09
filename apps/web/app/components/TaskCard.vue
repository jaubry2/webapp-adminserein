<script setup lang="ts">
import type { Tache } from "~/types/tache";

const props = withDefaults(
  defineProps<{
    label: string;
    patientName: string;
    date: string;
    accentColor?: "peach" | "lavender";
    statusLabel?: string;
    tache?: Tache;
  }>(),
  {
    accentColor: "peach",
  },
);

const professionnelName = computed(() => {
  if (props.tache?.professionnel) {
    return `${props.tache.professionnel.prenom} ${props.tache.professionnel.nom}`;
  }
  return "";
});

const handleViewPatient = () => {
  if (props.tache?.patientId) {
    navigateTo(`/patient/${props.tache.patientId}`);
  }
};
</script>

<template>
  <div
    class="relative flex flex-col gap-4 rounded-3xl border px-6 py-5 shadow-sm"
    :class="
      props.accentColor === 'peach'
        ? 'border-[#f4b7a0]/70 bg-[#fff7f3]'
        : 'border-[#c7c6ff]/70 bg-[#f7f6ff]'
    "
  >
    <div v-if="props.statusLabel" class="absolute right-6 top-6">
      <span
        class="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700"
      >
        <UIcon name="i-lucide-check-circle-2" class="h-3.5 w-3.5" />
        {{ props.statusLabel }}
      </span>
    </div>

    <div class="flex items-center gap-4">
      <div
        class="flex h-12 w-12 items-center justify-center rounded-full"
        :class="
          props.accentColor === 'peach'
            ? 'bg-[#ffe0d1]'
            : 'bg-[#e1ddff]'
        "
      >
        <UIcon
          :name="
            props.accentColor === 'peach'
              ? 'i-lucide-clipboard-list'
              : 'i-lucide-message-circle'
          "
          class="h-6 w-6 text-slate-700"
        />
      </div>

      <div class="flex-1 space-y-1">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {{ props.label }}
        </p>
        <p class="text-base font-semibold text-slate-900">
          {{ props.patientName }} – {{ props.date }}
        </p>
        <div v-if="professionnelName" class="flex items-center gap-2 text-sm text-slate-600">
          <UIcon name="i-lucide-user" class="h-4 w-4" />
          <span>Assistante sociale : {{ professionnelName }}</span>
        </div>
        <div v-if="props.tache?.details" class="mt-2 text-sm text-slate-600 line-clamp-2">
          {{ props.tache.details }}
        </div>
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-end gap-3">
      <UButton
        variant="outline"
        color="gray"
        size="sm"
        trailing-icon="i-lucide-arrow-right"
        class="rounded-full bg-white/70 border-slate-300 hover:bg-white"
      >
        Afficher détails tâche
      </UButton>

      <UButton
        v-if="props.tache?.patientId"
        variant="outline"
        color="gray"
        size="sm"
        trailing-icon="i-lucide-arrow-right"
        class="rounded-full bg-white/70 border-slate-300 hover:bg-white"
        @click="handleViewPatient"
      >
        Afficher profil patient
      </UButton>
    </div>
  </div>
</template>
