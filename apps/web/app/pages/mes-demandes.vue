<script setup lang="ts">
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { PDFDocument } from "pdf-lib";
import { getListFieldForm, getValue } from "~/composables/useInfoFormulaire";
import OngletInformationDemande from "~/components/OngletInformation/Demande.vue";

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

const filterStatut = ref<
  "TOUS" | "BROUILLON" | "EN_COURS" | "EN_ATTENTE_COMPLEMENT" | "TERMINEE" | "ANNULEE"
>("TOUS");

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
  ASH: "ASH",
};

const statutLabels: Record<string, string> = {
  BROUILLON: "Brouillon",
  EN_COURS: "En cours",
  EN_ATTENTE_COMPLEMENT: "En attente de réponse / validation",
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

const getCreatorName = (d: any): string => {
  // Si un professionnel est stocké côté backend
  if (d.professionnelInfo) {
    return `${d.professionnelInfo.prenom} ${d.professionnelInfo.nom}`;
  }

  // Sinon, on considère que c'est le particulier connecté
  return "Moi-même";
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

const APA_OFFICIAL_PDF_PATH = "/pdf/apa_remplissable.pdf";

const generateApaPdfFromDemande = async (
  donneesFormulaire: any,
  options: { download: boolean },
) => {
  if (!process.client) return;

  const existingPdfBytes = await fetch(APA_OFFICIAL_PDF_PATH).then((res) =>
    res.arrayBuffer(),
  );
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const form = pdfDoc.getForm();
  const field_names = form.getFields().map((field: any) => field.getName());

  Object.keys(donneesFormulaire ?? {}).forEach((key) => {
    const value = getValue(donneesFormulaire, key);
    const fields_list = getListFieldForm(donneesFormulaire, key);
    if (!value) {
      return;
    } else if (fields_list.length === 1) {
      if (field_names.includes(fields_list[0])) {
        form.getTextField(fields_list[0]).setText(value);
      }
    } else if (fields_list[0].startsWith("est")) {
      if (field_names.includes(value)) {
        form.getCheckBox(value).check();
      }
    } else {
      let charList = value.split("");
      if (charList.includes("-")) {
        const wait = [
          charList[8],
          charList[9],
          charList[5],
          charList[6],
          charList[0],
          charList[1],
          charList[2],
          charList[3],
        ];
        charList = wait;
      }
      for (let i = 0; i < fields_list.length; i++) {
        if (field_names.includes(fields_list[i])) {
          form.getTextField(fields_list[i]).setText(charList[i] || "");
        }
      }
    }
  });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });

  if (options.download) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "demande_APA_remplie.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } else {
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
};

const handleViewDemandeDocument = (d: any) => {
  if (d.typeDemande === "APA" && d.donneesFormulaire) {
    generateApaPdfFromDemande(d.donneesFormulaire, { download: false });
    return;
  }

  navigateTo(`/demande/${d.typeDemande.toLowerCase()}?demandeId=${d.id}`);
};

const handleDownloadDemandeDocument = (d: any) => {
  if (d.typeDemande === "APA" && d.donneesFormulaire) {
    generateApaPdfFromDemande(d.donneesFormulaire, { download: true });
    return;
  }

  navigateTo(
    `/demande/${d.typeDemande.toLowerCase()}?demandeId=${d.id}&action=download`,
  );
};

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

const updateDetailsMutation = useMutation({
  ...$orpc.updateDemandeDetails.mutationOptions(),
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: $orpc.listDemandes.queryKey(),
    });
    toast.add({
      title: "Commentaire mis à jour",
      description: "Le commentaire de la demande a été enregistré.",
    });
  },
  onError: (error: any) => {
    toast.add({
      title: "Erreur",
      description: error?.message || "Impossible de mettre à jour le commentaire.",
      color: "error",
    });
  },
});

const handleUpdateComment = async (payload: { id: string; details: string }) => {
  await updateDetailsMutation.mutateAsync({
    demandeId: payload.id,
    details: payload.details,
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
            <option value="EN_ATTENTE_COMPLEMENT">En attente de réponse / validation</option>
            <option value="TERMINEE">Terminée</option>
            <option value="ANNULEE">Annulée</option>
          </select>
        </div>
      </header>

      <OngletInformationDemande
        title="Mes demandes"
        :demandes="filteredDemandes"
        :is-loading="isLoading"
        :is-error="isError"
        empty-text="Aucune demande trouvée."
        :type-labels="typeDemandeLabels"
        :statut-labels="statutLabels"
        :statut-colors="statutColors"
        :get-creator-name="getCreatorName"
        :get-beneficiaire-name="getBeneficiaireName"
        :format-date="formatDate"
        :show-actions="true"
        @updateComment="handleUpdateComment"
      >
        <template #actions="{ demande: d }">
          <div class="flex items-center justify-end gap-2">
            <button
              class="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium secondary--text--color transition-colors hover:bg-gray-50"
              @click="handleViewDemandeDocument(d)"
            >
              <UIcon name="i-lucide-file-text" class="h-3.5 w-3.5" />
              Voir
            </button>
            <button
              class="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium secondary--text--color transition-colors hover:bg-gray-50"
              @click="handleDownloadDemandeDocument(d)"
            >
              <UIcon name="i-lucide-download" class="h-3.5 w-3.5" />
              Télécharger
            </button>
            <NuxtLink
              v-if="d.statut !== 'TERMINEE' && d.statut !== 'ANNULEE'"
              :to="`/demande/${d.typeDemande.toLowerCase()}?demandeId=${d.id}`"
              class="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium secondary--text--color transition-colors hover:bg-gray-50"
            >
              <UIcon name="i-lucide-pencil" class="h-3.5 w-3.5" />
              Modifier
            </NuxtLink>
            <button
              v-if="d.statut === 'EN_ATTENTE_COMPLEMENT'"
              @click="changeStatut(d.id, 'TERMINEE')"
              :disabled="updateStatutMutation.isPending.value"
              class="inline-flex items-center gap-1 rounded-lg border border-green-300 bg-white px-3 py-1.5 text-xs font-medium text-green-600 transition-colors hover:bg-green-50"
            >
              <UIcon name="i-lucide-check-circle" class="h-3.5 w-3.5" />
              Terminer
            </button>
          </div>
        </template>
      </OngletInformationDemande>
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
