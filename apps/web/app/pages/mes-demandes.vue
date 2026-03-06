<script setup lang="ts">
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";

const { $authClient, $orpc } = useNuxtApp();
const queryClient = useQueryClient();
const toast = useToast();
const session = $authClient.useSession();

definePageMeta({
  middleware: ["auth"],
});

const { data: userTypeData } = useQuery({
  ...$orpc.getUserType.queryOptions(),
  enabled: computed(() => !!session.value?.data && !session.value.isPending),
});
const userType = computed(() => userTypeData.value?.type || null);

const {
  data: demandes,
  isLoading,
  isError,
} = useQuery({
  ...$orpc.listDemandes.queryOptions(),
  enabled: computed(() => !!session.value?.data && !session.value.isPending),
  staleTime: 0,
  refetchOnMount: "always",
  refetchOnWindowFocus: "always",
});

const filterStatut = ref<"TOUS" | "BROUILLON" | "EN_COURS" | "EN_ATTENTE_COMPLEMENT" | "TERMINEE" | "ANNULEE">("TOUS");

const filteredDemandes = computed(() => {
  if (!demandes.value) return [];
  if (filterStatut.value === "TOUS") return demandes.value;
  return demandes.value.filter((d: any) => d.statut === filterStatut.value);
});

const typeDemandeLabels: Record<string, string> = {
  APA: "APA",
  CAF_AIDE_LOGEMENT: "Aide au logement (CAF)",
  RSA: "RSA",
  AAH: "AAH",
};

const statutLabels: Record<string, string> = {
  BROUILLON: "Brouillon",
  EN_COURS: "En cours",
  EN_ATTENTE_COMPLEMENT: "En attente de complément",
  TERMINEE: "Terminée",
  ANNULEE: "Annulée",
};

const statutColors: Record<string, string> = {
  BROUILLON: "bg-gray-100 text-gray-700",
  EN_COURS: "bg-blue-100 text-blue-700",
  EN_ATTENTE_COMPLEMENT: "bg-orange-100 text-orange-700",
  TERMINEE: "bg-green-100 text-green-700",
  ANNULEE: "bg-red-100 text-red-700",
};

const getBeneficiaireName = (d: any): string => {
  if (d.patientInfo) {
    return `${d.patientInfo.prenom} ${d.patientInfo.nom}`;
  }
  if (d.nomBeneficiaire || d.prenomBeneficiaire) {
    return `${d.prenomBeneficiaire || ""} ${d.nomBeneficiaire || ""}`.trim();
  }
  return "Non renseigné";
};

const formatDate = (dateStr: string | Date): string => {
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const updateStatutMutation = useMutation({
  ...$orpc.updateDemandeStatut.mutationOptions(),
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: $orpc.listDemandes.queryKey(),
    });
    toast.add({
      title: "Statut mis à jour",
      description: "Le statut de la demande a été modifié.",
    });
  },
  onError: (error: any) => {
    toast.add({
      title: "Erreur",
      description: error?.message || "Impossible de mettre à jour le statut.",
      color: "error",
    });
  },
});

const changeStatut = async (demandeId: string, statut: string) => {
  await updateStatutMutation.mutateAsync({
    demandeId,
    statut: statut as "BROUILLON" | "EN_COURS" | "EN_ATTENTE_COMPLEMENT" | "TERMINEE" | "ANNULEE",
  });
};

const showComplementModal = ref(false);
const complementDemandeId = ref<string | null>(null);
const complementMessage = ref("");

const openComplementModal = (demandeId: string) => {
  complementDemandeId.value = demandeId;
  complementMessage.value = "";
  showComplementModal.value = true;
};

const demanderComplementMutation = useMutation({
  ...$orpc.demanderComplementDemande.mutationOptions(),
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: $orpc.listDemandes.queryKey(),
    });
    toast.add({
      title: "Complément demandé",
      description: "Le particulier a été notifié de votre demande de complément.",
    });
    showComplementModal.value = false;
  },
  onError: (error: any) => {
    toast.add({
      title: "Erreur",
      description: error?.message || "Impossible de demander un complément.",
      color: "error",
    });
  },
});

const submitComplementRequest = async () => {
  if (!complementDemandeId.value || !complementMessage.value.trim()) return;
  await demanderComplementMutation.mutateAsync({
    demandeId: complementDemandeId.value,
    commentaire: complementMessage.value.trim(),
  });
};
</script>

<template>
  <div class="min-h-screen bg-white px-8 py-8 font--text">
    <div class="mx-auto max-w-6xl">
      <header class="mb-6">
        <h1 class="text-3xl font-bold secondary--text--color mb-4 font--title">
          Mes demandes
        </h1>

        <div class="flex items-center gap-3">
          <label class="text-sm quaternary--text--color">Filtrer par statut :</label>
          <select
            v-model="filterStatut"
            class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm secondary--text--color input-focus-primary"
          >
            <option value="TOUS">Tous</option>
            <option value="BROUILLON">Brouillon</option>
            <option value="EN_COURS">En cours</option>
            <option value="EN_ATTENTE_COMPLEMENT">En attente de complément</option>
            <option value="TERMINEE">Terminée</option>
            <option value="ANNULEE">Annulée</option>
          </select>
        </div>
      </header>

      <div class="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold secondary--text--color">
                  Type
                </th>
                <th class="px-6 py-4 text-left text-sm font-semibold secondary--text--color">
                  Bénéficiaire
                </th>
                <th class="px-6 py-4 text-left text-sm font-semibold secondary--text--color">
                  Statut
                </th>
                <th class="px-6 py-4 text-left text-sm font-semibold secondary--text--color">
                  Date
                </th>
                <th class="px-6 py-4 text-right text-sm font-semibold secondary--text--color">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody class="divide-y divide-gray-200 bg-white">
              <tr v-if="isLoading">
                <td colspan="5" class="px-6 py-12 text-center">
                  <p class="text-sm quaternary--text--color">
                    Chargement des demandes...
                  </p>
                </td>
              </tr>
              <tr v-else-if="isError">
                <td colspan="5" class="px-6 py-12 text-center">
                  <p class="text-sm text-red-500">
                    Erreur lors du chargement des demandes.
                  </p>
                </td>
              </tr>
              <tr
                v-for="d in filteredDemandes"
                v-else
                :key="d.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-4 text-sm font-medium secondary--text--color">
                  {{ typeDemandeLabels[d.typeDemande] || d.typeDemande }}
                </td>
                <td class="px-6 py-4 text-sm quaternary--text--color">
                  {{ getBeneficiaireName(d) }}
                </td>
                <td class="px-6 py-4">
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                    :class="statutColors[d.statut] || 'bg-gray-100 text-gray-700'"
                  >
                    {{ statutLabels[d.statut] || d.statut }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm quaternary--text--color">
                  {{ formatDate(d.createdAt) }}
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <NuxtLink
                      v-if="d.statut !== 'TERMINEE' && d.statut !== 'ANNULEE'"
                      :to="`/demande/${d.typeDemande.toLowerCase()}?demandeId=${d.id}`"
                      class="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium secondary--text--color transition-colors hover:bg-gray-50"
                    >
                      <UIcon name="i-lucide-pencil" class="h-3.5 w-3.5" />
                      Modifier
                    </NuxtLink>
                    <button
                      v-if="d.statut !== 'TERMINEE' && d.statut !== 'ANNULEE' && d.statut !== 'EN_ATTENTE_COMPLEMENT' && d.patientId && userType === 'PROFESSIONNEL'"
                      @click="openComplementModal(d.id)"
                      class="inline-flex items-center gap-1 rounded-lg border border-orange-300 bg-white px-3 py-1.5 text-xs font-medium text-orange-600 transition-colors hover:bg-orange-50"
                    >
                      <UIcon name="i-lucide-message-circle" class="h-3.5 w-3.5" />
                      Demander un complément
                    </button>
                    <button
                      v-if="d.statut !== 'TERMINEE'"
                      @click="changeStatut(d.id, 'TERMINEE')"
                      :disabled="updateStatutMutation.isPending.value"
                      class="inline-flex items-center gap-1 rounded-lg border border-green-300 bg-white px-3 py-1.5 text-xs font-medium text-green-600 transition-colors hover:bg-green-50"
                    >
                      <UIcon name="i-lucide-check" class="h-3.5 w-3.5" />
                      Terminer
                    </button>
                    <button
                      v-if="d.statut !== 'ANNULEE' && d.statut !== 'TERMINEE'"
                      @click="changeStatut(d.id, 'ANNULEE')"
                      :disabled="updateStatutMutation.isPending.value"
                      class="inline-flex items-center gap-1 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                    >
                      <UIcon name="i-lucide-x" class="h-3.5 w-3.5" />
                      Annuler
                    </button>
                    <button
                      v-if="d.statut === 'TERMINEE' || d.statut === 'ANNULEE'"
                      @click="changeStatut(d.id, 'EN_COURS')"
                      :disabled="updateStatutMutation.isPending.value"
                      class="inline-flex items-center gap-1 rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50"
                    >
                      <UIcon name="i-lucide-rotate-ccw" class="h-3.5 w-3.5" />
                      Rouvrir
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="!isLoading && !isError && filteredDemandes.length === 0">
                <td colspan="5" class="px-6 py-12 text-center">
                  <p class="text-sm quaternary--text--color">
                    Aucune demande trouvée.
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal demande de complément -->
    <div
      v-if="showComplementModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      @click.self="showComplementModal = false"
    >
      <div class="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <h2 class="text-lg font-semibold secondary--text--color mb-4">
          Demander un complément d'informations
        </h2>
        <p class="text-sm quaternary--text--color mb-4">
          Décrivez les informations manquantes que le particulier doit fournir.
        </p>
        <textarea
          v-model="complementMessage"
          rows="4"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm secondary--text--color input-focus-primary resize-none"
          placeholder="Ex : Merci de fournir votre numéro de sécurité sociale et une copie de votre pièce d'identité."
        />
        <div class="mt-4 flex items-center justify-end gap-3">
          <button
            @click="showComplementModal = false"
            class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium quaternary--text--color transition-colors hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            @click="submitComplementRequest"
            :disabled="!complementMessage.trim() || demanderComplementMutation.isPending.value"
            class="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="demanderComplementMutation.isPending.value">Envoi...</span>
            <span v-else>Envoyer la demande</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
