<template>
  <Teleport to="body">
    <Transition name="dropdown">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-40"
        @click.self="close"
      ></div>
    </Transition>
    <Transition name="dropdown">
      <div
        v-if="isOpen"
        class="fixed right-4 top-16 z-50 w-96 rounded-lg border border-gray-200 bg-white shadow-xl"
        style="max-height: calc(100vh - 5rem);"
      >
        <!-- En-tête -->
        <div class="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h3 class="text-lg font-semibold secondary--text--color">Notifications</h3>
          <div class="flex items-center gap-2">
            <button
              v-if="notifications && notifications.length > 0 && unreadCount > 0"
              @click="markAllAsRead"
              type="button"
              class="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
              :disabled="isMarkingAllAsRead"
            >
              {{ isMarkingAllAsRead ? "..." : "Tout marquer comme lu" }}
            </button>
            <button
              @click="close"
              type="button"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <UIcon name="i-lucide-x" class="h-5 w-5" />
            </button>
          </div>
        </div>

        <!-- Liste des notifications -->
        <div class="max-h-[calc(100vh-10rem)] overflow-y-auto">
          <div v-if="isLoading" class="p-8 text-center">
            <p class="text-sm quaternary--text--color">Chargement...</p>
          </div>

          <div v-else-if="isError" class="p-8 text-center">
            <p class="text-sm text-red-500">Erreur lors du chargement</p>
          </div>

          <div v-else-if="!notifications || notifications.length === 0" class="p-8 text-center">
            <UIcon name="i-lucide-bell-off" class="h-12 w-12 mx-auto text-gray-300 mb-2" />
            <p class="text-sm quaternary--text--color">Aucune notification</p>
          </div>

          <div v-else class="divide-y divide-gray-100">
            <button
              v-for="notif in notifications"
              :key="notif.id"
              @click="handleNotificationClick(notif)"
              type="button"
              class="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
              :class="!notif.lue ? 'bg-blue-50/50' : ''"
            >
              <div class="flex items-start gap-3">
                <!-- Indicateur de type -->
                <div
                  class="shrink-0 mt-1 h-2 w-2 rounded-full"
                  :class="getTypeColor(notif.type)"
                ></div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2">
                    <p
                      class="text-sm font-medium secondary--text--color"
                      :class="!notif.lue ? 'font-semibold' : ''"
                    >
                      {{ notif.titre }}
                    </p>
                    <span
                      v-if="!notif.lue"
                      class="shrink-0 h-2 w-2 rounded-full bg-blue-500"
                    ></span>
                  </div>
                  <p class="text-xs quaternary--text--color mt-1 line-clamp-2">
                    {{ notif.message }}
                  </p>
                  <p class="text-xs quaternary--text--color mt-1">
                    {{ formatDate(notif.createdAt) }}
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { Notification } from "~/types/notification";
import { useMutation, useQueryClient } from "@tanstack/vue-query";

const props = defineProps<{
  isOpen: boolean;
  notifications?: Notification[];
  isLoading?: boolean;
  isError?: boolean;
  unreadCount: number;
}>();

const emit = defineEmits<{
  "update:isOpen": [value: boolean];
  "close": [];
  "notification-click": [notification: Notification];
}>();

const { $orpc } = useNuxtApp();
const queryClient = useQueryClient();
const toast = useToast();

// Mutation pour marquer une notification comme lue
const markAsReadMutation = useMutation({
  ...$orpc.markNotificationAsRead.mutationOptions(),
  onSuccess: () => {
    // Invalider les requêtes de notifications
    queryClient.invalidateQueries({
      queryKey: $orpc.listNotificationsByProfessionnel.queryKey(),
    });
    queryClient.invalidateQueries({
      queryKey: $orpc.getUnreadNotificationsCount.queryKey(),
    });
  },
});

// Mutation pour marquer toutes les notifications comme lues
const markAllAsReadMutation = useMutation({
  ...$orpc.markAllNotificationsAsRead.mutationOptions(),
  onSuccess: () => {
    // Invalider les requêtes de notifications
    queryClient.invalidateQueries({
      queryKey: $orpc.listNotificationsByProfessionnel.queryKey(),
    });
    queryClient.invalidateQueries({
      queryKey: $orpc.getUnreadNotificationsCount.queryKey(),
    });
    toast.add({
      title: "Notifications marquées comme lues",
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

const isMarkingAllAsRead = computed(() => markAllAsReadMutation.isPending.value);

const close = () => {
  emit("close");
  emit("update:isOpen", false);
};

const handleNotificationClick = async (notif: Notification) => {
  // Marquer comme lue si ce n'est pas déjà fait
  if (!notif.lue) {
    await markAsReadMutation.mutateAsync({ notificationId: notif.id });
  }

  // Naviguer si un lien est présent
  if (notif.lien) {
    await navigateTo(notif.lien);
    close();
  }

  emit("notification-click", notif);
};

const markAllAsRead = async () => {
  await markAllAsReadMutation.mutateAsync();
};

const getTypeColor = (type: Notification["type"]): string => {
  const colors: Record<Notification["type"], string> = {
    INFO: "bg-blue-500",
    WARNING: "bg-yellow-500",
    ERROR: "bg-red-500",
    SUCCESS: "bg-green-500",
  };
  return colors[type] || "bg-gray-500";
};

const formatDate = (date: Date | string): string => {
  const d = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
