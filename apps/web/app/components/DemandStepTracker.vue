<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { DemandeStep, StepStatus } from "~/types/demandes";
import { stepsByDemandeType } from "~/utils/demandes/steps-config";

const props = defineProps<{
  demandeType: string;
  statusByStep?: Record<string, StepStatus>;
  editable?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:statusByStep", value: Record<string, StepStatus>): void;
  (e: "stepClick", payload: { stepId: string; status: StepStatus }): void;
}>();

const allSteps = computed<DemandeStep[]>(() => {
  return stepsByDemandeType[props.demandeType] ?? [];
});

const localStatus = ref<Record<string, StepStatus>>({});

watch(
  () => props.statusByStep,
  (value) => {
    if (value) {
      localStatus.value = { ...value };
    } else {
      const initial: Record<string, StepStatus> = {};
      for (const step of allSteps.value) {
        initial[step.id] = "todo";
      }
      localStatus.value = initial;
    }
  },
  { immediate: true },
);

function computeEffectiveStatus(step: DemandeStep): StepStatus {
  const explicit = localStatus.value[step.id] ?? "todo";
  if (explicit === "done") return "done";
  if (!step.dependsOn || step.dependsOn.length === 0) return explicit;
  const hasUnmetDependency = step.dependsOn.some(
    (dep) => localStatus.value[dep] !== "done",
  );
  if (hasUnmetDependency) return "blocked";
  return explicit;
}

function statusToClasses(status: StepStatus): string {
  switch (status) {
    case "done":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "in_progress":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "blocked":
      return "bg-gray-100 text-gray-400 border-gray-200";
    case "todo":
    default:
      return "bg-yellow-50 text-yellow-800 border-yellow-200";
  }
}

function statusToDotClasses(status: StepStatus): string {
  switch (status) {
    case "done":
      return "bg-emerald-500";
    case "in_progress":
      return "bg-amber-500";
    case "blocked":
      return "bg-gray-300";
    case "todo":
    default:
      return "bg-yellow-400";
  }
}

function cycleStatus(current: StepStatus): StepStatus {
  if (current === "todo") return "in_progress";
  if (current === "in_progress") return "done";
  return "todo";
}

function handleStepClick(step: DemandeStep) {
  const current = localStatus.value[step.id] ?? "todo";
  const effective = computeEffectiveStatus(step);

  if (!props.editable || effective === "blocked") {
    emit("stepClick", { stepId: step.id, status: effective });
    return;
  }

  const next = cycleStatus(current);
  const updated = { ...localStatus.value, [step.id]: next };
  localStatus.value = updated;
  emit("update:statusByStep", updated);
  emit("stepClick", { stepId: step.id, status: next });
}
</script>

<template>
  <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
    <div class="mb-3 flex items-center justify-between gap-2">
      <h3 class="text-sm font-semibold secondary--text--color">
        Suivi de la demande
      </h3>
      <p class="text-[11px] quaternary--text--color">
        Cliquez sur une étape pour la faire avancer.
      </p>
    </div>

    <div class="flex flex-col gap-4 md:flex-row md:items-stretch">
      <div class="flex-1">
        <div
          class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div
            v-for="(step, index) in allSteps"
            :key="step.id"
            class="flex items-center md:flex-1"
          >
            <div
              class="relative flex cursor-pointer flex-col items-center gap-1 text-center"
              @click="handleStepClick(step)"
            >
              <div
                class="flex items-center justify-center rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors"
                :class="statusToClasses(computeEffectiveStatus(step))"
              >
                <UIcon
                  v-if="step.icon"
                  :name="step.icon"
                  class="mr-1.5 h-3.5 w-3.5"
                />
                <span>{{ step.label }}</span>
              </div>
              <span
                class="mt-0.5 inline-flex h-1.5 w-1.5 rounded-full"
                :class="statusToDotClasses(computeEffectiveStatus(step))"
              />
            </div>

            <div
              v-if="index < allSteps.length - 1"
              class="hidden flex-1 items-center md:flex"
            >
              <div class="mx-2 h-px flex-1 bg-gray-200" />
            </div>
          </div>
        </div>
      </div>

      <div class="mt-2 flex flex-wrap gap-2 md:mt-0 md:w-40 md:flex-col">
        <div class="flex items-center gap-2 text-[11px] quaternary--text--color">
          <span class="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          <span>Fait</span>
        </div>
        <div class="flex items-center gap-2 text-[11px] quaternary--text--color">
          <span class="inline-flex h-2 w-2 rounded-full bg-amber-500" />
          <span>En cours / à faire</span>
        </div>
        <div class="flex items-center gap-2 text-[11px] quaternary--text--color">
          <span class="inline-flex h-2 w-2 rounded-full bg-gray-300" />
          <span>Bloqué (étapes avant)</span>
        </div>
      </div>
    </div>
  </div>
</template>

