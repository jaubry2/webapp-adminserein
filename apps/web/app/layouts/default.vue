<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import type { Notification } from "~/types/notification";
import type { Particulier } from "~/types/particulier";

const { $authClient, $orpc } = useNuxtApp();
const session = $authClient.useSession();
const toast = useToast();

// Rediriger vers login si non connecté
watchEffect(() => {
  if (!session.value.isPending && !session.value.data) {
    navigateTo("/login", { replace: true });
  }
});

// État du dropdown de notifications
const isNotificationDropdownOpen = ref(false);

// Récupérer le type d'utilisateur
const { data: userTypeData } = useQuery({
  ...$orpc.getUserType.queryOptions(),
  enabled: computed(() => !!session.value?.data && !session.value.isPending),
});

const userType = computed(() => userTypeData.value?.type || null);
const isProfessionnel = computed(() => userType.value === "PROFESSIONNEL");
const isParticulier = computed(() => userType.value === "PARTICULIER");

// Récupérer le professionnel connecté (seulement si professionnel)
const { data: currentProfessionnel } = useQuery({
  ...$orpc.getCurrentProfessionnel.queryOptions(),
  enabled: computed(
    () =>
      !!session.value?.data &&
      !session.value.isPending &&
      isProfessionnel.value
  ),
});

// Récupérer le particulier connecté (seulement si particulier)
const { data: currentParticulier } = useQuery({
  ...$orpc.getCurrentParticulier.queryOptions(),
  enabled: computed(
    () =>
      !!session.value?.data &&
      !session.value.isPending &&
      isParticulier.value
  ),
}) as { data: Ref<Particulier | undefined> };

// Récupérer le nombre de notifications non lues avec polling (toutes les 5 secondes) - seulement pour professionnels
const { data: unreadCountData } = useQuery({
  ...$orpc.getUnreadNotificationsCount.queryOptions(),
  enabled: computed(
    () =>
      !!session.value?.data &&
      !session.value.isPending &&
      isProfessionnel.value
  ),
  refetchInterval: 5000, // Polling toutes les 5 secondes
});

const unreadCount = computed(() => unreadCountData.value?.count || 0);

// Récupérer la liste des notifications avec polling (toutes les 10 secondes) - seulement pour professionnels
const {
  data: notifications,
  isLoading: isLoadingNotifications,
  isError: isErrorNotifications,
} = useQuery({
  ...$orpc.listNotificationsByProfessionnel.queryOptions(),
  enabled: computed(
    () =>
      !!session.value?.data &&
      !session.value.isPending &&
      isProfessionnel.value &&
      isNotificationDropdownOpen.value
  ),
  refetchInterval: 10000, // Polling toutes les 10 secondes
});

const displayName = computed(() => {
  if (isProfessionnel.value && currentProfessionnel.value) {
    return `${currentProfessionnel.value.prenom} ${currentProfessionnel.value.nom}`;
  }
  if (isParticulier.value && currentParticulier.value?.patient?.informationIdentite) {
    const info = currentParticulier.value.patient.informationIdentite;
    return `${info.prenom} ${info.nomUsage}`;
  }
  return "Profil";
});

const toggleNotificationDropdown = () => {
  isNotificationDropdownOpen.value = !isNotificationDropdownOpen.value;
};

const closeNotificationDropdown = () => {
  isNotificationDropdownOpen.value = false;
};

const handleSignOut = async () => {
  try {
    await $authClient.signOut({
      fetchOptions: {
        onSuccess: async () => {
          toast.add({ title: "Déconnexion réussie" });
          await navigateTo("/login", { replace: true });
        },
        onError: (error) => {
          toast.add({
            title: "Erreur de déconnexion",
            description: error?.error?.message || "Erreur inconnue",
          });
        },
      },
    });
  } catch (error: any) {
    toast.add({
      title: "Une erreur est survenue lors de la déconnexion",
      description: error.message || "Veuillez réessayer.",
    });
  }
};
</script>

<template>
  <div
    class="h-svh flex tertiary--background--color secondary--text--color font--text"
  >
    <aside
      class="w-64 primary--background--color flex flex-col justify-between py-8 px-6 shadow-[4px_0_12px_rgba(15,23,42,0.06)]"
    >
      <div class="h-[15%] text-2xl font-semibold leading-tight tracking-tight">
        Admin
        <br />
        Serein
      </div>

      <div
        class="w-full flex h-[70%] flex-col justify-around text-sm font-medium"
      >
        <!-- Menu pour professionnels -->
        <template v-if="isProfessionnel">
          <ButtonLayout
            icon="i-lucide-users"
            label="Liste des patients"
            to="/patients"
          />
          <ButtonLayout
            icon="i-lucide-clipboard-list"
            label="Tâche à faire"
            to="/taches"
          />
          <ButtonLayout
            icon="i-lucide-file-plus-2"
            label="Faire une demande"
            to="/demandes"
          />
        </template>
        <!-- Menu pour particuliers -->
        <template v-else-if="isParticulier">
          <ButtonLayout
            icon="i-lucide-user"
            label="Mes informations"
            to="/mes-informations"
          />
          <ButtonLayout
            icon="i-lucide-clipboard-list"
            label="Mes tâches"
            to="/dashboard"
          />
        </template>
      </div>

      <div class="space-y-4 h-[15%]">
        <div class="h-px w-full tertiary--background--color" />
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div
              class="flex h-9 w-9 items-center justify-center rounded-full bg-[#e3efff]"
            >
              <UIcon
                name="i-lucide-user-round"
                class="h-4 w-4 secondary--text--color"
              />
            </div>
            <div class="text-xs leading-tight">
              <p class="font-semibold">{{ displayName }}</p>
              <p>Paramètres et compte</p>
            </div>
          </div>

          <div class="flex flex-col items-center gap-3">
            <!-- Notifications seulement pour professionnels -->
            <NotificationBell
              v-if="isProfessionnel"
              :unread-count="unreadCount"
              :is-open="isNotificationDropdownOpen"
              @toggle="toggleNotificationDropdown"
              @update:is-open="isNotificationDropdownOpen = $event"
            />
            <button
              type="button"
              class="hover:secondary--text--color transition"
            >
              <UIcon name="i-lucide-settings-2" class="h-5 w-5" />
            </button>
            <button
              type="button"
              class="hover:secondary--text--color transition cursor-pointer"
              @click="handleSignOut"
              title="Déconnexion"
            >
              <UIcon name="i-lucide-log-out" class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </aside>

    <UMain class="flex-1 overflow-y-auto">
      <slot />
    </UMain>

    <!-- Dropdown de notifications (seulement pour professionnels) -->
    <NotificationDropdown
      v-if="isProfessionnel"
      :is-open="isNotificationDropdownOpen"
      :notifications="notifications"
      :is-loading="isLoadingNotifications"
      :is-error="isErrorNotifications"
      :unread-count="unreadCount"
      @update:is-open="isNotificationDropdownOpen = $event"
      @close="closeNotificationDropdown"
    />
  </div>
</template>
