<script setup lang="ts">
import type { Patient } from "~/types/patient";
import type { Tache } from "~/types/tache";
import type { Document } from "~/types/document";
import { useQuery, useMutation } from "@tanstack/vue-query";

definePageMeta({
  middleware: ["auth"],
});

const { $authClient, $orpc } = useNuxtApp();
const session = $authClient.useSession();
const toast = useToast();

// Récupérer le type d'utilisateur
const { data: userTypeData } = useQuery({
  ...$orpc.getUserType.queryOptions(),
  enabled: computed(() => !!session.value?.data && !session.value.isPending),
});

const isParticulier = computed(() => userTypeData.value?.type === "PARTICULIER");

// Rediriger si ce n'est pas un particulier
watchEffect(() => {
  if (userTypeData.value?.type && !isParticulier.value) {
    navigateTo("/dashboard", { replace: true });
  }
});

// Récupération du patient depuis l'API
const {
  data: apiPatient,
  isLoading,
  isError,
} = useQuery({
  ...$orpc.getPatientByIdForParticulier.queryOptions(),
  enabled: computed(() => {
    return (
      !!session.value?.data &&
      !session.value.isPending &&
      isParticulier.value
    );
  }),
});

// Demandes d'accès au dossier pour ce patient
const {
  data: demandesAcces,
  isLoading: isLoadingDemandesAcces,
  isError: isErrorDemandesAcces,
  refetch: refetchDemandesAcces,
} = useQuery({
  ...$orpc.listDemandesAccesByPatient.queryOptions(),
  enabled: computed(() => {
    return (
      !!session.value?.data &&
      !session.value.isPending &&
      isParticulier.value
    );
  }),
});

// Professionnels ayant accès au dossier du patient
const {
  data: professionnelsAcces,
  isLoading: isLoadingProfessionnelsAcces,
  isError: isErrorProfessionnelsAcces,
} = useQuery({
  ...$orpc.listProfessionnelsByParticulier.queryOptions(),
  enabled: computed(() => {
    return (
      !!session.value?.data &&
      !session.value.isPending &&
      isParticulier.value
    );
  }),
});

const repondreDemandeAccesMutationOptions =
  $orpc.repondreDemandeAcces.mutationOptions();
const repondreDemandeAccesMutation = useMutation({
  ...repondreDemandeAccesMutationOptions,
  onSuccess: async () => {
    await refetchDemandesAcces();
    toast.add({
      title: "Réponse enregistrée",
      description: "Votre choix a bien été pris en compte.",
    });
  },
  onError: (error: any) => {
    toast.add({
      title: "Erreur",
      description: error?.message || "Une erreur est survenue.",
      color: "error",
    });
  },
});

// Récupération des tâches
const { data: tachesData } = useQuery({
  ...$orpc.listTachesByParticulier.queryOptions(),
  enabled: computed(() => {
    return (
      !!session.value?.data &&
      !session.value.isPending &&
      isParticulier.value
    );
  }),
}) as { data: Ref<Tache[] | undefined> };

// Récupération des documents
const patientIdForDocs = computed(() => apiPatient.value?.id || "");
const { data: documentsData } = useQuery({
  ...$orpc.listDocumentsByPatient.queryOptions({
    input: {
      patientId: patientIdForDocs.value,
    },
  }),
  enabled: computed(() => {
    return (
      !!session.value?.data &&
      !session.value.isPending &&
      isParticulier.value &&
      !!patientIdForDocs.value
    );
  }),
}) as { data: Ref<Document[] | undefined> };

// Mapping API -> type Patient utilisé par l'UI
const patient = computed<Patient | null>(() => {
  if (!apiPatient.value) return null;

  const p = apiPatient.value as any;
  const info = p.informationIdentite;
  const coord = p.informationCoordonnee;
  const conjointInfo = p.informationConjoint as
    | {
        nomUsage?: string;
        nomNaissance?: string;
        prenom?: string;
        autresPrenoms?: string[] | null;
        genre?: "MASCULIN" | "FEMININ" | "AUTRE";
        dateNaissance?: string | Date | null;
        villeNaissance?: string;
        departementNaissance?: string;
        paysNaissance?: string;
        nationalites?: string[] | null;
        numeroSecuriteSociale?: string;
      }
    | null
    | undefined;

  const dateNaissance =
    info?.dateNaissance instanceof Date
      ? info.dateNaissance.toLocaleDateString("fr-FR")
      : typeof info?.dateNaissance === "string"
        ? new Date(info.dateNaissance).toLocaleDateString("fr-FR")
        : "";

  let conjoint: Patient["conjoint"] = undefined;
  if (conjointInfo) {
    const conjointDateNaissance =
      conjointInfo.dateNaissance instanceof Date
        ? conjointInfo.dateNaissance.toLocaleDateString("fr-FR")
        : typeof conjointInfo.dateNaissance === "string"
          ? new Date(conjointInfo.dateNaissance).toLocaleDateString("fr-FR")
          : "";

    conjoint = {
      nom: conjointInfo.nomUsage ?? "",
      prenom: conjointInfo.prenom ?? "",
      nomNaissance: conjointInfo.nomNaissance ?? undefined,
      autresPrenoms: conjointInfo.autresPrenoms?.join(", ") ?? undefined,
      sexe:
        conjointInfo.genre === "MASCULIN"
          ? "Homme"
          : conjointInfo.genre === "FEMININ"
            ? "Femme"
            : conjointInfo.genre
              ? "Autre"
              : undefined,
      dateNaissance: conjointDateNaissance || undefined,
      lieuNaissance: conjointInfo.villeNaissance ?? undefined,
      departementNaissance: conjointInfo.departementNaissance ?? undefined,
      paysNaissance: conjointInfo.paysNaissance ?? undefined,
      nationalites: conjointInfo.nationalites?.join(", ") ?? undefined,
      numeroSecuriteSociale:
        conjointInfo.numeroSecuriteSociale ?? undefined,
    };
  }

  return {
    id: p.id,
    dossierNumber: p.numeroDossier,
    nom: info?.nomUsage ?? "",
    prenom: info?.prenom ?? "",
    dateNaissance,
    lieuNaissance: info?.villeNaissance,
    departementNaissance: info?.departementNaissance,
    paysNaissance: info?.paysNaissance,
    nomNaissance: info?.nomNaissance,
    autresPrenoms: info?.autresPrenoms?.join(", "),
    sexe:
      info?.genre === "MASCULIN"
        ? "Homme"
        : info?.genre === "FEMININ"
          ? "Femme"
          : info?.genre
            ? "Autre"
            : undefined,
    telephone: coord?.numeroTelephone ?? undefined,
    email: coord?.adresseMail ?? undefined,
    adresse: coord?.adresse ?? undefined,
    informationComplementaires: coord?.informationComplementaires ?? undefined,
    codePostal: coord?.codePostal ?? undefined,
    ville: coord?.ville ?? undefined,
    departement: coord?.departement ?? undefined,
    pays: coord?.pays ?? undefined,
    numeroSecuriteSociale: info?.numeroSecuriteSociale ?? undefined,
    nationalites: info?.nationalites?.join(", ") ?? undefined,
    situationFamiliale:
      info?.situationFamiliale === "CELIBATAIRE"
        ? "Célibataire"
        : info?.situationFamiliale === "MARIE"
          ? "Marié(e)"
          : info?.situationFamiliale === "DIVORCE"
            ? "Divorcé(e)"
            : info?.situationFamiliale === "VEUF"
              ? "Veuf(ve)"
              : info?.situationFamiliale === "PACSE"
                ? "Pacsé(e)"
                : info?.situationFamiliale === "CONCUBINAGE"
                  ? "Concubinage"
                  : undefined,
    caisseRetraite: info?.caisseRetraite ?? undefined,
    conjoint,
    dernieresModifications: "",
  };
});

const age = computed(() => {
  if (!patient.value?.dateNaissance) return null;
  const birthDate = new Date(patient.value.dateNaissance);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
});

const activeTab = ref("information");

const tabs = [
  { id: "information", label: "Information", icon: "i-lucide-info" },
  { id: "document", label: "Document", icon: "i-lucide-file-text" },
  { id: "tache", label: "Tâche", icon: "i-lucide-check-square" },
  { id: "acces", label: "Accès", icon: "i-lucide-shield-check" },
];
</script>

<template>
  <div class="min-h-svh px-10 py-10 font--text">
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <UIcon name="i-lucide-loader-2" class="animate-spin text-4xl text-primary" />
      <span class="ml-4 text-muted">Chargement...</span>
    </div>

    <div v-else-if="isError" class="flex items-center justify-center py-12">
      <p class="text-red-500">Erreur lors du chargement des informations</p>
    </div>

    <div v-else-if="patient" class="mx-auto max-w-5xl space-y-6">
      <!-- En-tête -->
      <header class="space-y-2">
        <h1 class="text-3xl font-bold secondary--text--color">
          {{ patient.prenom }} {{ patient.nom }}
        </h1>
        <div class="flex items-center gap-4 text-sm quaternary--text--color">
          <span>Dossier n°{{ patient.dossierNumber }}</span>
          <span v-if="age">• {{ age }} ans</span>
        </div>
      </header>

      <!-- Onglets -->
      <div class="mb-6 flex items-center justify-between shrink-0">
        <div class="flex gap-2">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="cursor-pointer inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            :class="
              activeTab === tab.id
                ? 'bg-[#2e3a45] text-[#f5f7fa]'
                : 'bg-gray-100 primary--text--color hover:bg-gray-200'
            "
          >
            <UIcon :name="tab.icon" class="h-4 w-4 font--title" />
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Contenu des onglets -->
      <div class="space-y-6">
        <!-- Onglet Information -->
        <div v-if="activeTab === 'information'" class="space-y-6">
          <OngletInformationIdentite
            :patient="patient"
            :is-editing="false"
            @save="() => {}"
            @cancel="() => {}"
          />
          <OngletInformationConjoint
            :patient="patient"
          />
          <OngletInformationCoordonnee
            :patient="patient"
            :is-editing="false"
            @save="() => {}"
            @cancel="() => {}"
          />
        </div>

        <!-- Onglet Document -->
        <div v-if="activeTab === 'document'">
          <OngletInformationDocument
            :patient-id="patient.id"
            :documents="documentsData || []"
            :is-loading="false"
            :is-error="false"
          />
        </div>

        <!-- Onglet Tâche -->
        <div v-if="activeTab === 'tache'" class="space-y-4">
          <h2 class="text-lg font-semibold secondary--text--color">Mes tâches</h2>
          <div
            v-if="!tachesData || tachesData.length === 0"
            class="text-center py-8"
          >
            <p class="text-sm quaternary--text--color">
              Aucune tâche pour le moment
            </p>
          </div>
          <div v-else class="space-y-4">
            <TaskCard
              v-for="tache in tachesData"
              :key="tache.id"
              :id="tache.id"
              :label="`${tache.typeDemarche} - ${tache.details}`"
              :patient-name="
                tache.patient?.informationIdentite
                  ? `${tache.patient.informationIdentite.prenom} ${tache.patient.informationIdentite.nomUsage}`
                  : 'N/A'
              "
              :date="
                tache.date instanceof Date
                  ? tache.date.toLocaleDateString('fr-FR')
                  : new Date(tache.date).toLocaleDateString('fr-FR')
              "
              :accent-color="
                tache.etat === 'TERMINEE'
                  ? 'green'
                  : tache.etat === 'EN_COURS'
                    ? 'blue'
                    : tache.etat === 'ANNULEE'
                      ? 'red'
                      : 'peach'
              "
              :status-label="tache.etat"
            />
          </div>
        </div>

        <!-- Onglet Accès -->
        <div v-if="activeTab === 'acces'" class="space-y-6">
          <!-- Professionnels ayant accès -->
          <div class="space-y-3">
            <h2 class="text-lg font-semibold secondary--text--color">
              Professionnels ayant accès à mon dossier
            </h2>
            <div
              v-if="isLoadingProfessionnelsAcces"
              class="text-sm quaternary--text--color"
            >
              Chargement des professionnels...
            </div>
            <div
              v-else-if="isErrorProfessionnelsAcces"
              class="text-sm text-red-500"
            >
              Erreur lors du chargement des professionnels.
            </div>
            <div
              v-else-if="
                !professionnelsAcces || professionnelsAcces.length === 0
              "
              class="text-sm quaternary--text--color"
            >
              Aucun professionnel n’a actuellement accès à votre dossier.
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="pro in professionnelsAcces"
                :key="pro.id"
                class="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3"
              >
                <div>
                  <p class="text-sm font-medium secondary--text--color">
                    {{ pro.prenom }} {{ pro.nom }}
                  </p>
                  <p class="text-xs quaternary--text--color">
                    {{ pro.fonction || "Professionnel" }}
                  </p>
                </div>
                <div class="text-xs quaternary--text--color text-right">
                  <p v-if="pro.dateAttribution">
                    Depuis
                    {{
                      new Date(pro.dateAttribution).toLocaleDateString("fr-FR")
                    }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Demandes d'accès -->
          <div class="space-y-4">
            <h2 class="text-lg font-semibold secondary--text--color">
              Demandes d'accès à mon dossier
            </h2>
            <div
              v-if="isLoadingDemandesAcces"
              class="text-sm quaternary--text--color"
            >
              Chargement des demandes d'accès...
            </div>
            <div
              v-else-if="isErrorDemandesAcces"
              class="text-sm text-red-500"
            >
              Erreur lors du chargement des demandes d'accès.
            </div>
            <div
              v-else-if="!demandesAcces || demandesAcces.length === 0"
              class="text-sm quaternary--text--color"
            >
              Aucune demande d'accès en attente.
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="demande in demandesAcces"
                :key="demande.id"
                class="rounded-lg border border-gray-200 bg-white px-4 py-3 flex flex-col gap-2"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium secondary--text--color">
                      {{ demande.professionnel?.prenom }}
                      {{ demande.professionnel?.nom }}
                    </p>
                    <p class="text-xs quaternary--text--color">
                      {{ demande.professionnel?.fonction || "Professionnel" }}
                    </p>
                  </div>
                  <span
                    class="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200"
                  >
                    En attente
                  </span>
                </div>
                <div class="flex gap-2 justify-end mt-2">
                  <button
                    type="button"
                    class="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    @click="
                      repondreDemandeAccesMutation.mutate({
                        demandeId: demande.id,
                        decision: 'REFUSER',
                      })
                    "
                  >
                    Refuser
                  </button>
                  <button
                    type="button"
                    class="px-3 py-1.5 rounded-lg bg-[var(--primary-color)] text-xs font-medium text-white hover:opacity-90 transition-colors"
                    @click="
                      repondreDemandeAccesMutation.mutate({
                        demandeId: demande.id,
                        decision: 'ACCEPTER',
                      })
                    "
                  >
                    Accepter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
