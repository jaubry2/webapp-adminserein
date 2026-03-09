<script setup lang="ts">
import { computed, ref, useSlots } from "vue";
import DemandStepTracker from "~/components/DemandStepTracker.vue";
import {
  backendStatutToStepStatus,
  type BackendEtapeStatut,
  type StepStatus,
} from "~/types/demandes";

const props = defineProps<{
  title?: string;
  demandes: any[] | null | undefined;
  isLoading: boolean;
  isError: boolean;
  emptyText: string;
  typeLabels: Record<string, string>;
  statutLabels: Record<string, string>;
  statutColors: Record<string, string>;
  getCreatorName: (d: any) => string;
  formatDate: (date: string | Date) => string;
  showActions?: boolean;
  showStepTracker?: boolean;
}>();

const expandedById = ref<Record<string, boolean>>({});

function isExpanded(id: string): boolean {
  if (expandedById.value[id] === undefined) {
    return true;
  }
  return expandedById.value[id];
}

function toggleExpanded(id: string) {
  expandedById.value = {
    ...expandedById.value,
    [id]: !isExpanded(id),
  };
}

const slots = useSlots();

const hasActions = computed(() => props.showActions && !!slots.actions);

const hasDemandes = computed(
  () => !!props.demandes && props.demandes.length > 0,
);

function buildStepStatusFromStatut(d: any): Record<string, StepStatus> {
  const base: Record<string, StepStatus> = {};

  const etapes = (d.etapes ?? []) as {
    stepCode: string;
    statut: BackendEtapeStatut;
  }[];

  if (Array.isArray(etapes) && etapes.length > 0) {
    for (const etape of etapes) {
      if (!etape.stepCode || !etape.statut) continue;
      base[etape.stepCode] = backendStatutToStepStatus(etape.statut);
    }
    return base;
  }

  const statut = d.statut as string;

  if (statut === "BROUILLON") {
    base.collecte_documents = "in_progress";
  } else if (statut === "EN_COURS") {
    base.collecte_documents = "done";
    base.remplir_formulaire = "in_progress";
  } else if (statut === "EN_ATTENTE_COMPLEMENT") {
    base.collecte_documents = "done";
    base.remplir_formulaire = "done";
    base.envoi_dossier = "in_progress";
  }

  return base;
}
</script>

<template>
  <div class="space-y-4">
    <h2 v-if="title" class="text-lg font-semibold secondary--text--color">
      {{ title }}
    </h2>

    <div
      v-if="isLoading"
      class="rounded-lg border border-gray-200 bg-white p-8 text-center"
    >
      <p class="text-sm quaternary--text--color">Chargement des demandes...</p>
    </div>

    <div
      v-else-if="isError"
      class="rounded-lg border border-gray-200 bg-white p-8 text-center"
    >
      <p class="text-sm text-red-500">
        Erreur lors du chargement des demandes.
      </p>
    </div>

    <div
      v-else-if="!hasDemandes"
      class="rounded-lg border border-gray-200 bg-white p-8 text-center"
    >
      <p class="text-sm quaternary--text--color">
        {{ emptyText }}
      </p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="d in demandes"
        :key="d.id"
        class="rounded-lg border border-gray-200 bg-white shadow-sm"
      >
        <div
          class="flex flex-col gap-3 border-b border-gray-100 px-6 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="flex flex-1 items-start gap-3">
            <div class="flex flex-col gap-1">
              <p class="text-sm font-medium secondary--text--color">
                {{ typeLabels[d.typeDemande] || d.typeDemande }}
              </p>
              <p class="text-xs quaternary--text--color">
                Créée par
                <span class="font-medium">{{ getCreatorName(d) }}</span>
              </p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex flex-col items-end gap-1">
              <div class="flex items-center gap-2">
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                  :class="statutColors[d.statut] || 'bg-gray-100 text-gray-700'"
                >
                  {{ statutLabels[d.statut] || d.statut }}
                </span>
                <span class="text-xs quaternary--text--color">
                  {{ formatDate(d.createdAt) }}
                </span>
              </div>
              <button
                type="button"
                class="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-2.5 py-1 text-[11px] font-medium quaternary--text--color transition-colors hover:bg-gray-50"
                @click="
                  toggleExpanded(d.id);
                  console.log(d);
                "
              >
                <UIcon
                  :name="
                    isExpanded(d.id)
                      ? 'i-lucide-chevron-up'
                      : 'i-lucide-chevron-down'
                  "
                  class="h-3 w-3"
                />
                <span>{{
                  isExpanded(d.id) ? "Masquer le détail" : "Afficher le détail"
                }}</span>
              </button>
            </div>
            <div v-if="hasActions" class="flex items-center gap-2">
              <slot name="actions" :demande="d" />
            </div>
          </div>
        </div>

        <div v-if="isExpanded(d.id)" class="border-t border-gray-100 px-4 py-3">
          <DemandStepTracker
            :demande-type="d.typeDemande"
            :status-by-step="buildStepStatusFromStatut(d)"
            :demande-id="d.id"
            :etapes="d.etapes"
            :editable="false"
          />
        </div>
      </div>
    </div>
  </div>
</template>
