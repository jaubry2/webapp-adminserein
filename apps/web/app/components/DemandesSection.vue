<script setup lang="ts">
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import OngletInformationDemande from "~/components/OngletInformation/Demande.vue";

const props = defineProps<{
  demandes: any[] | null | undefined;
  isLoading: boolean;
  isError: boolean;
  emptyText: string;
  typeLabels: Record<string, string>;
  statutLabels: Record<string, string>;
  statutColors: Record<string, string>;
  getCreatorName: (d: any) => string;
  getBeneficiaireName?: (d: any) => string;
  formatDate: (date: string | Date) => string;
}>();

const emit = defineEmits<{
  (e: "updateComment", payload: { id: string; details: string }): void;
  (e: "viewDemande", demande: any): void;
  (e: "downloadDemande", demande: any): void;
  (e: "editDemande", demande: any): void;
}>();

const { $orpc } = useNuxtApp();
const queryClient = useQueryClient();
const toast = useToast();

// Mutation pour changer le statut d'une demande (bouton "Terminer")
const updateStatutMutation = useMutation({
  ...$orpc.updateDemandeStatut.mutationOptions(),
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: $orpc.listDemandes.queryKey(),
    });
    toast.add({
      title: "Demande mise à jour",
      description: "Le statut a été mis à jour en temps réel.",
    });
  },
  onError: (error: any) => {
    toast.add({
      title: "Erreur",
      description:
        error?.message || "Impossible de mettre à jour le statut de la demande.",
      color: "error",
    });
  },
});

const changeStatut = async (demandeId: string, statut: string) => {
  await updateStatutMutation.mutateAsync({
    demandeId,
    statut:
      statut as
        | "BROUILLON"
        | "EN_COURS"
        | "EN_ATTENTE_COMPLEMENT"
        | "TERMINEE"
        | "ANNULEE",
  });
};

// --- Téléversement du dossier ASH directement depuis la demande ---
const showAshUploadModal = ref(false);
const ashUploadDemande = ref<any | null>(null);
const ashUploadFile = ref<File | null>(null);
const ashUploadError = ref<string | null>(null);
const ashUploadLoading = ref(false);

const uploadDocumentMutation = useMutation({
  ...$orpc.uploadDocument.mutationOptions(),
  onSuccess: () => {
    toast.add({
      title: "Document téléversé",
      description:
        "Le dossier de la demande a été ajouté aux documents du patient.",
    });
    queryClient.invalidateQueries({
      queryKey: $orpc.listDemandes.queryKey(),
    });
  },
  onError: (error: any) => {
    toast.add({
      title: "Erreur",
      description:
        error?.message || "Impossible de téléverser le document de la demande.",
      color: "error",
    });
  },
});

const openAshUploadModal = (demande: any) => {
  ashUploadDemande.value = demande;
  ashUploadFile.value = null;
  ashUploadError.value = null;
  showAshUploadModal.value = true;
};

const handleAshFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  ashUploadError.value = null;
  if (!files || files.length === 0) {
    ashUploadFile.value = null;
    return;
  }
  ashUploadFile.value = files[0];
};

const submitAshUpload = async () => {
  if (!ashUploadDemande.value || !ashUploadDemande.value.patientId) {
    ashUploadError.value = "Patient introuvable pour cette demande.";
    return;
  }
  if (!ashUploadFile.value) {
    ashUploadError.value = "Veuillez sélectionner un fichier.";
    return;
  }

  try {
    ashUploadLoading.value = true;
    const file = ashUploadFile.value;
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);

    await uploadDocumentMutation.mutateAsync({
      patientId: ashUploadDemande.value.patientId,
      nom: "Dossier ASH",
      categorie: "ADMINISTRATIF",
      contenuBase64: base64,
      typeMime: file.type || "application/pdf",
      taille: file.size,
      tacheId: undefined,
    });

    showAshUploadModal.value = false;
  } catch (error: any) {
    ashUploadError.value =
      error?.message || "Impossible de téléverser le dossier ASH.";
  } finally {
    ashUploadLoading.value = false;
  }
};
</script>

<template>
  <div class="space-y-4">
    <OngletInformationDemande
      title="Mes demandes"
      :demandes="demandes"
      :is-loading="isLoading"
      :is-error="isError"
      :empty-text="emptyText"
      :type-labels="typeLabels"
      :statut-labels="statutLabels"
      :statut-colors="statutColors"
      :get-creator-name="getCreatorName"
      :get-beneficiaire-name="getBeneficiaireName"
      :format-date="formatDate"
      :show-actions="true"
      @updateComment="emit('updateComment', $event)"
      @uploadAshDossier="openAshUploadModal"
      @viewDemande="emit('viewDemande', $event)"
      @downloadDemande="emit('downloadDemande', $event)"
      @editDemande="emit('editDemande', $event)"
    >
      <template #actions="{ demande: d }">
        <div class="flex items-center justify-end gap-2">
          <!-- On laisse le wrapper gérer Voir/Télécharger/Modifier pour APA/ASH,
               ici on ne garde que les actions de statut -->
          <button
            v-if="d.statut === 'EN_ATTENTE_COMPLEMENT'"
            @click="changeStatut(d.id, 'TERMINEE')"
            :disabled="updateStatutMutation.isPending.value"
            class="inline-flex items-center gap-1 rounded-lg border border-green-300 bg-white px-3 py-1.5 text-xs font-medium text-green-600 transition-colors hover:bg-green-50 disabled:opacity-50"
          >
            <UIcon name="i-lucide-check-circle" class="h-3.5 w-3.5" />
            Terminer
          </button>
        </div>
      </template>
    </OngletInformationDemande>

    <!-- Modal téléversement dossier ASH -->
    <div
      v-if="showAshUploadModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      @click.self="showAshUploadModal = false"
    >
      <div
        class="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
      >
        <h2 class="text-lg font-semibold secondary--text--color mb-2">
          Téléverser le dossier ASH
        </h2>
        <p class="text-sm quaternary--text--color mb-4">
          Ajoutez ici le document rempli de la demande d'ASH pour ce patient.
        </p>

        <div class="space-y-4">
          <div>
            <label
              class="block text-sm font-medium quaternary--text--color mb-1"
            >
              Fichier
            </label>
            <input
              type="file"
              accept=".pdf,image/*"
              class="block w-full text-sm text-gray-900 file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--primary-color)] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:opacity-90"
              @change="handleAshFileChange"
            />
          </div>

          <p v-if="ashUploadError" class="text-xs text-red-500">
            {{ ashUploadError }}
          </p>
        </div>

        <div class="mt-6 flex items-center justify-end gap-3">
          <button
            @click="showAshUploadModal = false"
            class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium quaternary--text--color transition-colors hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            @click="submitAshUpload"
            :disabled="ashUploadLoading"
            class="rounded-lg bg-[var(--primary-color)] px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="ashUploadLoading">Téléversement...</span>
            <span v-else>Téléverser</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

