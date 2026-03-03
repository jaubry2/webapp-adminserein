<template>
  <Teleport to="body">
    <Transition name="task-detail-modal">
      <div
        v-if="isOpen && tache"
        class="fixed inset-0 z-50 flex items-center justify-center"
      >
        <!-- Overlay (en tenant compte de la sidebar de 64px) -->
        <div
          class="absolute inset-0 left-64 bg-black/30 backdrop-blur-sm"
          @click="emitClose"
        />

        <!-- Carte de détail -->
        <div
          class="relative z-10 w-full max-w-xl max-h-[90vh] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl flex flex-col"
          @click.stop
        >
          <!-- En-tête -->
          <header
            class="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-4"
          >
            <div class="space-y-1">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {{ typeDemarcheLabel }}
              </p>
              <h2 class="text-lg font-semibold secondary--text--color font--title">
                Détail de la tâche
              </h2>
              <p class="text-xs quaternary--text--color">
                Créée le
                <span class="font-medium">
                  {{ createdAtLabel }}
                </span>
              </p>
            </div>
            <div class="flex items-center gap-2">
              <span
                v-if="etatLabel"
                class="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700"
              >
                <UIcon name="i-lucide-check-circle-2" class="h-3.5 w-3.5" />
                {{ etatLabel }}
              </span>
              <button
                type="button"
                class="text-gray-400 hover:text-gray-600 transition-colors"
                @click="emitClose"
              >
                <UIcon name="i-lucide-x" class="h-5 w-5" />
              </button>
            </div>
          </header>

          <!-- Contenu -->
          <div class="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <!-- Infos principales -->
            <section class="grid grid-cols-2 gap-4 text-sm">
              <div class="space-y-1">
                <p class="text-xs quaternary--text--color">Type de démarche</p>
                <p class="font-medium secondary--text--color">
                  {{ typeDemarcheLabel }}
                </p>
              </div>
              <div class="space-y-1">
                <p class="text-xs quaternary--text--color">Date de la tâche</p>
                <p class="font-medium secondary--text--color">
                  {{ dateLabel }}
                </p>
              </div>
              <div class="space-y-1">
                <p class="text-xs quaternary--text--color">État</p>
                <p class="font-medium secondary--text--color">
                  {{ etatLabel || "Non renseigné" }}
                </p>
              </div>
            </section>

            <div class="border-t border-gray-200 my-2" />

            <!-- Patient / Professionnel selon le type d'utilisateur -->
            <section class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div class="space-y-1">
                <p class="text-xs quaternary--text--color">
                  Patient concerné
                </p>
                <p class="font-medium secondary--text--color">
                  {{ patientName }}
                </p>
              </div>
              <div class="space-y-1">
                <p class="text-xs quaternary--text--color">
                  Professionnel
                </p>
                <p class="font-medium secondary--text--color">
                  {{ professionnelLabel }}
                </p>
              </div>
            </section>

            <div class="border-t border-gray-200 my-2" />

            <!-- Description -->
            <section class="space-y-2">
              <p class="text-xs quaternary--text--color">
                Description de la tâche
              </p>
              <p
                v-if="tache.details"
                class="whitespace-pre-line text-sm secondary--text--color"
              >
                {{ tache.details }}
              </p>
              <p v-else class="text-sm quaternary--text--color">
                Aucun détail supplémentaire n'a été renseigné pour cette tâche.
              </p>
            </section>
          </div>

          <!-- Pied de modale -->
          <footer
            class="flex items-center justify-between gap-3 border-t border-gray-200 px-6 py-3"
          >
            <p class="text-xs quaternary--text--color">
              {{ footerHint }}
            </p>
            <div class="flex gap-2">
              <UButton
                v-if="canViewPatient"
                variant="outline"
                color="gray"
                size="sm"
                trailing-icon="i-lucide-arrow-right"
                class="rounded-full bg-white/70 border-slate-300 hover:bg-white"
                @click="handleViewPatient"
              >
                Voir le dossier patient
              </UButton>
              <UButton
                color="gray"
                size="sm"
                class="rounded-full"
                @click="emitClose"
              >
                Fermer
              </UButton>
            </div>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useQuery } from "@tanstack/vue-query";
import type { Tache } from "~/types/tache";

const props = defineProps<{
  isOpen: boolean;
  tache?: Tache;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { $orpc } = useNuxtApp();

const { data: userTypeData } = useQuery({
  ...$orpc.getUserType.queryOptions(),
});

const userType = computed(() => userTypeData.value?.type || null);
const isProfessionnel = computed(() => userType.value === "PROFESSIONNEL");
const isParticulier = computed(() => userType.value === "PARTICULIER");

const tache = computed(() => props.tache);

const typeDemarcheLabel = computed(() => {
  if (!tache.value) return "";
  const labels: Record<Tache["typeDemarche"], string> = {
    ADMINISTRATIVE: "Administrative",
    MEDICALE: "Médicale",
    SOCIALE: "Sociale",
    JURIDIQUE: "Juridique",
    LOGEMENT: "Logement",
    EMPLOI: "Emploi",
    AUTRE: "Autre",
  };
  return labels[tache.value.typeDemarche] || tache.value.typeDemarche;
});

const etatLabel = computed(() => {
  if (!tache.value) return "";
  switch (tache.value.etat) {
    case "A_FAIRE":
      return "À faire";
    case "EN_COURS":
      return "En cours";
    case "TERMINEE":
      return "Terminée";
    case "ANNULEE":
      return "Annulée";
    default:
      return tache.value.etat;
  }
});

const dateLabel = computed(() => {
  if (!tache.value) return "";
  const d =
    tache.value.date instanceof Date
      ? tache.value.date
      : new Date(tache.value.date);
  return isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
});

const createdAtLabel = computed(() => {
  if (!tache.value) return "";
  const d =
    tache.value.createdAt instanceof Date
      ? tache.value.createdAt
      : new Date(tache.value.createdAt);
  return isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
});

const patientName = computed(() => {
  if (tache.value?.patient?.informationIdentite) {
    const info = tache.value.patient.informationIdentite;
    return `${info.nomUsage} ${info.prenom}`;
  }
  return "Patient inconnu";
});

const professionnelLabel = computed(() => {
  if (tache.value?.professionnel) {
    const p = tache.value.professionnel;
    return `${p.prenom} ${p.nom}${p.fonction ? " – " + p.fonction : ""}`;
  }
  return "Non renseigné";
});

const canViewPatient = computed(
  () => isProfessionnel.value && !!tache.value?.patientId,
);

const footerHint = computed(() => {
  if (isProfessionnel.value) {
    return "Ces informations sont visibles uniquement par les professionnels autorisés.";
  }
  if (isParticulier.value) {
    return "Ces informations vous permettent de suivre vos démarches avec vos professionnels.";
  }
  return "";
});

const emitClose = () => {
  emit("close");
};

const handleViewPatient = () => {
  if (tache.value?.patientId && isProfessionnel.value) {
    navigateTo(`/patient/${tache.value.patientId}`);
    emit("close");
  }
};
</script>

<style scoped>
.task-detail-modal-enter-active,
.task-detail-modal-leave-active {
  transition: opacity 0.2s ease;
}

.task-detail-modal-enter-from,
.task-detail-modal-leave-to {
  opacity: 0;
}

.task-detail-modal-enter-active .relative,
.task-detail-modal-leave-active .relative {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.task-detail-modal-enter-from .relative,
.task-detail-modal-leave-to .relative {
  opacity: 0;
  transform: scale(0.97);
}
</style>

