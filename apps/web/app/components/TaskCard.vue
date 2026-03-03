<script setup lang="ts">
import { computed, ref } from "vue";
import type { Tache } from "~/types/tache";

type TaskAccentColor =
  | "peach"
  | "lavender"
  | "emerald"
  | "sky"
  | "amber"
  | "violet"
  | "teal"
  | "indigo"
  | "slate";

const props = withDefaults(
  defineProps<{
    label: string;
    patientName: string;
    date: string;
    accentColor?: TaskAccentColor;
    statusLabel?: string;
    tache?: Tache;
  }>(),
  {
    accentColor: "peach",
  },
);

const showDetail = ref(false);

const cardColorClasses = computed(() => {
  switch (props.accentColor) {
    case "peach":
      return "border-[#f4b7a0]/70 bg-[#fff7f3]";
    case "lavender":
      return "border-[#c7c6ff]/70 bg-[#f7f6ff]";
    case "emerald":
      return "border-emerald-200 bg-emerald-50";
    case "sky":
      return "border-sky-200 bg-sky-50";
    case "amber":
      return "border-amber-200 bg-amber-50";
    case "violet":
      return "border-violet-200 bg-violet-50";
    case "teal":
      return "border-teal-200 bg-teal-50";
    case "indigo":
      return "border-indigo-200 bg-indigo-50";
    case "slate":
      return "border-slate-200 bg-slate-50";
    default:
      return "border-slate-200 bg-slate-50";
  }
});

const iconBgClasses = computed(() => {
  switch (props.accentColor) {
    case "peach":
      return "bg-[#ffe0d1]";
    case "lavender":
      return "bg-[#e1ddff]";
    case "emerald":
      return "bg-emerald-100";
    case "sky":
      return "bg-sky-100";
    case "amber":
      return "bg-amber-100";
    case "violet":
      return "bg-violet-100";
    case "teal":
      return "bg-teal-100";
    case "indigo":
      return "bg-indigo-100";
    case "slate":
      return "bg-slate-100";
    default:
      return "bg-slate-100";
  }
});

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
    :class="cardColorClasses"
  >
    <div v-if="props.statusLabel" class="absolute right-6 top-6">
      <span
        class="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700"
        v-if="props.tache?.etat === 'TERMINEE'"
      >
        <UIcon name="i-lucide-check-circle-2" class="h-3.5 w-3.5" />
        {{ props.statusLabel }}
      </span>
      <span
        class="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700"
        v-if="props.statusLabel === 'À faire'"
      >
        <UIcon name="i-lucide-pen" class="h-3.5 w-3.5" />
        {{ props.statusLabel }}
      </span>
      <span
        class="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700"
        v-if="props.tache?.etat === 'EN_COURS'"
      >
        <UIcon name="i-lucide-hourglass" class="h-3.5 w-3.5" />
        {{ props.statusLabel }}
      </span>
      <span
        class="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700"
        v-if="props.tache?.etat === 'ANNULEE'"
      >
        <UIcon name="i-lucide-circle-x" class="h-3.5 w-3.5" />
        {{ props.statusLabel }}
      </span>
    </div>

    <div class="flex items-center gap-4">
      <div
        class="flex h-12 w-12 items-center justify-center rounded-full"
        :class="iconBgClasses"
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
        <div
          v-if="professionnelName"
          class="flex items-center gap-2 text-sm text-slate-600"
        >
          <UIcon name="i-lucide-user" class="h-4 w-4" />
          <span>Assistante sociale : {{ professionnelName }}</span>
        </div>
        <div
          v-if="props.tache?.details"
          class="mt-2 text-sm text-slate-600 line-clamp-2"
        >
          {{ props.tache.details }}
        </div>
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-end gap-3">
      <UButton
        v-if="props.tache"
        variant="outline"
        color="gray"
        size="sm"
        trailing-icon="i-lucide-arrow-right"
        class="rounded-full bg-white/70 border-slate-300 hover:bg-white"
        @click="showDetail = true"
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

    <TaskDetailModal
      v-if="props.tache"
      :is-open="showDetail"
      :tache="props.tache"
      @close="showDetail = false"
    />
  </div>
</template>
