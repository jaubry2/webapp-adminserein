<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useMutation } from "@tanstack/vue-query";
import { useNuxtApp } from "#app";
import {
  stepStatusToBackendStatut,
  normalizeEtapeTodos,
  toggleTodoStatus,
  type DemandeStep,
  type StepStatus,
  type EtapeTodoItem,
} from "~/types/demandes";
import { stepsByDemandeType } from "~/utils/demandes/steps-config";

const props = defineProps<{
  demandeType: string;
  statusByStep?: Record<string, StepStatus>;
  editable?: boolean;
  demandeId?: string;
  etapes?: {
    stepCode: string;
    description?: string | null;
    todos?: unknown | null;
  }[];
}>();

const emit = defineEmits<{
  (e: "update:statusByStep", value: Record<string, StepStatus>): void;
  (e: "stepClick", payload: { stepId: string; status: StepStatus }): void;
}>();

const allSteps = computed<DemandeStep[]>(() => {
  return stepsByDemandeType[props.demandeType] ?? [];
});

const localStatus = ref<Record<string, StepStatus>>({});
const activeStepId = ref<string | null>(null);
const isPanelOpen = ref(false);
const localTodosByStep = ref<Record<string, EtapeTodoItem[]>>({});

const { $orpc } = useNuxtApp();

const upsertEtapeMutation = useMutation({
  ...$orpc.upsertDemandeEtape.mutationOptions(),
});

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

const activeStep = computed<DemandeStep | null>(() => {
  if (!activeStepId.value) return null;
  return allSteps.value.find((s) => s.id === activeStepId.value) ?? null;
});

const activeEtapeInfo = computed<{
  description?: string | null;
  todos?: unknown | null;
} | null>(() => {
  if (!activeStepId.value || !props.etapes) return null;
  const match = props.etapes.find((e) => e.stepCode === activeStepId.value);
  return match ?? null;
});

const activeTodos = computed<EtapeTodoItem[]>(() => {
  if (!activeStepId.value) return [];
  return localTodosByStep.value[activeStepId.value] ?? [];
});

function handleStepClick(step: DemandeStep) {
  const current = localStatus.value[step.id] ?? "todo";
  const effective = computeEffectiveStatus(step);

  activeStepId.value = step.id;
  isPanelOpen.value = true;

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

function validateActiveStep() {
  if (!activeStepId.value) return;
  const updated = {
    ...localStatus.value,
    [activeStepId.value]: "done" as StepStatus,
  };
  localStatus.value = updated;
  emit("update:statusByStep", updated);
  emit("stepClick", { stepId: activeStepId.value, status: "done" });

  if (props.demandeId) {
    upsertEtapeMutation.mutate({
      demandeId: props.demandeId,
      stepCode: activeStepId.value,
      statut: stepStatusToBackendStatut("done"),
    });
  }
}

function updateActiveTodos(updater: (current: EtapeTodoItem[]) => EtapeTodoItem[]) {
  if (!activeStepId.value || !props.demandeId) return;
  const current = localTodosByStep.value[activeStepId.value] ?? [];
  const updated = updater(current);
  localTodosByStep.value = {
    ...localTodosByStep.value,
    [activeStepId.value]: updated,
  };

  upsertEtapeMutation.mutate({
    demandeId: props.demandeId,
    stepCode: activeStepId.value,
    todos: updated,
  });
}

function handleToggleTodo(item: EtapeTodoItem) {
  updateActiveTodos((current) =>
    current.map((t) =>
      t.id === item.id ? toggleTodoStatus(t, "click") : t,
    ),
  );
}

function handleToggleIgnore(item: EtapeTodoItem) {
  updateActiveTodos((current) =>
    current.map((t) =>
      t.id === item.id ? toggleTodoStatus(t, "ignore") : t,
    ),
  );
}

watch(
  () => props.etapes,
  (value) => {
    const map: Record<string, EtapeTodoItem[]> = { ...localTodosByStep.value };
    for (const etape of value ?? []) {
      if (!map[etape.stepCode]) {
        map[etape.stepCode] = normalizeEtapeTodos(etape.todos);
      }
    }
    localTodosByStep.value = map;
  },
  { immediate: true, deep: true },
);
</script>

<template>
  <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
    <div class="mb-3 flex items-center justify-between gap-2">
      <h3 class="text-sm font-semibold secondary--text--color">
        Suivi de la demande
      </h3>
      <p class="text-[11px] quaternary--text--color">
        Cliquez sur une étape pour voir le détail.
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
        <div
          class="flex items-center gap-2 text-[11px] quaternary--text--color"
        >
          <span class="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          <span>Fait</span>
        </div>
        <div
          class="flex items-center gap-2 text-[11px] quaternary--text--color"
        >
          <span class="inline-flex h-2 w-2 rounded-full bg-amber-500" />
          <span>En cours / à faire</span>
        </div>
        <div
          class="flex items-center gap-2 text-[11px] quaternary--text--color"
        >
          <span class="inline-flex h-2 w-2 rounded-full bg-gray-300" />
          <span>Bloqué (étapes avant)</span>
        </div>
      </div>
    </div>

    <div
      v-if="isPanelOpen && activeStep"
      class="fixed inset-0 z-40 flex justify-end"
    >
      <div class="flex-1 bg-black/20" @click="isPanelOpen = false" />
      <div
        class="h-full w-80 sm:w-96 bg-white shadow-xl border-l border-gray-200 flex flex-col p-4"
      >
        <div class="flex items-center justify-between gap-2 mb-2">
          <h4 class="text-xs font-semibold secondary--text--color">
            Détail de l'étape
          </h4>
          <button
            type="button"
            class="rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-medium text-white hover:bg-emerald-600"
            @click="validateActiveStep"
          >
            <UIcon name="i-lucide-check" class="h-3 w-3" />
            Valider cette étape
          </button>
          <button
            type="button"
            class="rounded-full border border-gray-300 bg-white px-2 py-0.5 text-[11px] quaternary--text--color hover:bg-gray-50"
            @click="isPanelOpen = false"
          >
            Fermer
          </button>
        </div>

        <p class="text-xs font-medium secondary--text--color mb-1">
          {{ activeStep.label }}
        </p>
        <p class="mb-3 text-[11px] quaternary--text--color leading-snug">
          {{
            activeEtapeInfo?.description &&
            activeEtapeInfo.description.length > 0
              ? activeEtapeInfo.description
              : "Aucune description supplémentaire pour cette étape."
          }}
        </p>

        <div class="space-y-1.5 overflow-y-auto pr-1">
          <p class="text-[11px] font-semibold secondary--text--color">
            To-do de l'étape
          </p>
          <div v-if="activeTodos.length > 0">
            <ul class="space-y-1">
              <li
                v-for="item in activeTodos"
                :key="item.id"
                class="flex items-start gap-2 text-[11px]"
              >
                <button
                  type="button"
                  class="mt-[2px] inline-flex h-3 w-3 items-center justify-center rounded border border-gray-400"
                  @click="handleToggleTodo(item)"
                >
                  <span
                    v-if="item.status === 'DONE'"
                    class="h-2 w-2 bg-emerald-500 rounded-[2px]"
                  />
                </button>
                <span
                  class="flex-1"
                  :class="[
                    'quaternary--text--color',
                    item.status === 'DONE' && 'line-through text-gray-400',
                    item.status === 'IGNORED' &&
                      'line-through text-gray-400 italic',
                  ]"
                >
                  {{ item.label }}
                </span>
                <button
                  type="button"
                  class="mt-[1px] inline-flex h-4 w-4 items-center justify-center rounded-full border border-gray-300 bg-white text-[10px] text-gray-500 hover:bg-gray-50"
                  :title="
                    item.status === 'IGNORED'
                      ? 'Réintégrer cet élément'
                      : 'Ignorer cet élément'
                  "
                  @click="handleToggleIgnore(item)"
                >
                  <UIcon
                    :name="
                      item.status === 'IGNORED'
                        ? 'i-lucide-undo-2'
                        : 'i-lucide-ban'
                    "
                    class="h-3 w-3"
                  />
                </button>
              </li>
            </ul>
          </div>
          <p v-else class="text-[11px] quaternary--text--color italic">
            Aucune to-do enregistrée pour cette étape.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
