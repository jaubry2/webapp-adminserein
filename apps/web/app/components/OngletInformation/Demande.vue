<script setup lang="ts">
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
}>();

const slots = useSlots();

const hasActions = computed(
  () => props.showActions && !!slots.actions,
);

const hasDemandes = computed(
  () => !!props.demandes && props.demandes.length > 0,
);
</script>

<template>
  <div class="space-y-4">
    <h2
      v-if="title"
      class="text-lg font-semibold secondary--text--color"
    >
      {{ title }}
    </h2>

    <div
      v-if="isLoading"
      class="rounded-lg border border-gray-200 bg-white p-8 text-center"
    >
      <p class="text-sm quaternary--text--color">
        Chargement des demandes...
      </p>
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

    <div
      v-else
      class="rounded-lg border border-gray-200 bg-white shadow-sm overflow-x-auto"
    >
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-semibold secondary--text--color"
            >
              Type
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-semibold secondary--text--color"
            >
              Créée par
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-semibold secondary--text--color"
            >
              Statut
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-semibold secondary--text--color"
            >
              Date
            </th>
            <th
              v-if="hasActions"
              class="px-6 py-3 text-right text-xs font-semibold secondary--text--color"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr
            v-for="d in demandes"
            :key="d.id"
            class="hover:bg-gray-50 transition-colors"
          >
            <td
              class="px-6 py-3 text-sm font-medium secondary--text--color"
            >
              {{ typeLabels[d.typeDemande] || d.typeDemande }}
            </td>
            <td class="px-6 py-3 text-sm quaternary--text--color">
              {{ getCreatorName(d) }}
            </td>
            <td class="px-6 py-3">
              <span
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                :class="statutColors[d.statut] || 'bg-gray-100 text-gray-700'"
              >
                {{ statutLabels[d.statut] || d.statut }}
              </span>
            </td>
            <td class="px-6 py-3 text-sm quaternary--text--color">
              {{ formatDate(d.createdAt) }}
            </td>
            <td
              v-if="hasActions"
              class="px-6 py-3 text-right"
            >
              <slot
                name="actions"
                :demande="d"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

