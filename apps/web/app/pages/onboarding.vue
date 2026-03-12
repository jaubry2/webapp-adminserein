<script setup lang="ts">
import { ref } from "vue";
import { useMutation } from "@tanstack/vue-query";

definePageMeta({
  layout: false,
  middleware: ["auth"],
});

const { $orpc } = useNuxtApp();
const toast = useToast();

const initializing = ref(true);
const patientId = ref<string | null>(null);

const basicInfo = ref({
  prenom: "",
  nom: "",
  dateNaissance: "",
});

const saving = ref(false);

const initializeParticulierMutation = useMutation({
  ...$orpc.initializeParticulierAccount.mutationOptions(),
});

const updatePatientMutation = useMutation({
  ...$orpc.updatePatient.mutationOptions(),
});

const updateUserProfileMutation = useMutation({
  ...$orpc.updateCurrentUserProfile.mutationOptions(),
});

onMounted(async () => {
  try {
    const result = (await initializeParticulierMutation.mutateAsync()) as
      | { patientId?: string }
      | undefined;
    patientId.value = result?.patientId ?? null;
  } catch (error: any) {
    console.error("Erreur lors de l'initialisation du compte particulier:", error);
    toast.add({
      title: "Erreur",
      description:
        error?.message ||
        "Impossible d'initialiser votre espace particulier. Veuillez réessayer.",
      color: "error",
    });
  } finally {
    initializing.value = false;
  }
});

const handleSubmit = async () => {
  if (!patientId.value) {
    navigateTo("/mes-informations", { replace: true });
    return;
  }

  saving.value = true;
  try {
    await updatePatientMutation.mutateAsync({
      patientId: patientId.value,
      informationIdentite: {
        prenom: basicInfo.value.prenom || "",
        nomUsage: basicInfo.value.nom || "",
        nomNaissance: basicInfo.value.nom || "",
        dateNaissance: basicInfo.value.dateNaissance || "1970-01-01",
      },
    });

    await updateUserProfileMutation.mutateAsync({
      prenom: basicInfo.value.prenom || "",
      nom: basicInfo.value.nom || "",
    });

    toast.add({
      title: "Bienvenue",
      description: "Vos informations de base ont été enregistrées.",
    });

    navigateTo("/mes-informations", { replace: true });
  } catch (error: any) {
    console.error(
      "Erreur lors de l'enregistrement des informations de base:",
      error,
    );
    toast.add({
      title: "Erreur",
      description:
        error?.message || "Impossible d'enregistrer vos informations de base.",
      color: "error",
    });
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-slate-900/80 px-4"
  >
    <div
      class="w-full max-w-md rounded-2xl bg-white shadow-xl p-6 space-y-6 relative"
    >
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">
            Bienvenue sur AdminSerein
          </h1>
          <p class="mt-1 text-sm text-slate-500">
            Renseigne quelques informations pour personnaliser ton dossier.
          </p>
        </div>
        <UIcon
          name="i-lucide-user-round"
          class="h-8 w-8 text-slate-700 shrink-0"
        />
      </div>

      <div v-if="initializing" class="flex justify-center py-6">
        <UIcon
          name="i-lucide-loader-2"
          class="h-6 w-6 animate-spin text-primary"
        />
      </div>

      <form v-else class="space-y-4" @submit.prevent="handleSubmit">
        <UFormGroup label="Prénom" name="prenom" required>
          <UInput
            v-model="basicInfo.prenom"
            placeholder="Ton prénom"
            autocomplete="given-name"
          />
        </UFormGroup>

        <UFormGroup label="Nom" name="nom" required>
          <UInput
            v-model="basicInfo.nom"
            placeholder="Ton nom"
            autocomplete="family-name"
          />
        </UFormGroup>

        <UFormGroup label="Date de naissance" name="dateNaissance" required>
          <UInput
            v-model="basicInfo.dateNaissance"
            type="date"
            placeholder="YYYY-MM-DD"
          />
        </UFormGroup>

        <UButton
          type="submit"
          block
          size="lg"
          :loading="saving"
          class="mt-4"
        >
          Commencer
        </UButton>
      </form>
    </div>
  </div>
</template>

