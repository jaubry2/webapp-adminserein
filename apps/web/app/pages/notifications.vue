<script setup lang="ts">
import { computed, ref } from "vue";
import { useQuery } from "@tanstack/vue-query";
import type { Notification } from "~/types/notification";

definePageMeta({
  middleware: ["auth"],
});

const { $orpc } = useNuxtApp();

const {
  data: notifications,
  isLoading,
  isError,
} = useQuery({
  ...$orpc.listNotificationsByProfessionnel.queryOptions(),
});

const statusFilter = ref<"ALL" | "UNREAD" | "READ">("ALL");
const typeFilter = ref<"ALL" | Notification["type"]>("ALL");
const sortOrder = ref<"DESC" | "ASC">("DESC");

const filteredNotifications = computed(() => {
  if (!notifications.value) return [];

  let result = [...notifications.value];

  // Filtre par statut de lecture
  if (statusFilter.value === "UNREAD") {
    result = result.filter((n) => !n.lue);
  } else if (statusFilter.value === "READ") {
    result = result.filter((n) => n.lue);
  }

  // Filtre par type
  if (typeFilter.value !== "ALL") {
    result = result.filter((n) => n.type === typeFilter.value);
  }

  // Tri par date
  result.sort((a, b) => {
    const da = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
    const db = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
    return sortOrder.value === "DESC"
      ? db.getTime() - da.getTime()
      : da.getTime() - db.getTime();
  });

  return result;
});

const formatDate = (date: Date | string): string => {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
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
</script>

<template>
  <div class="min-h-svh px-10 py-10 font--text">
    <div class="mx-auto max-w-4xl space-y-6">
      <header class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold secondary--text--color font--title">
            Notifications
          </h1>
          <p class="text-sm quaternary--text--color mt-1">
            Historique complet de vos notifications, lues et non lues.
          </p>
        </div>
      </header>

      <section class="rounded-2xl border border-gray-200 bg-white">
        <div
          class="border-b border-gray-200 px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <p class="text-sm quaternary--text--color">
            {{ notifications?.length || 0 }} notification(s) •
            {{ filteredNotifications.length }} affichée(s)
          </p>

          <div class="flex flex-wrap items-center gap-3 text-xs">
            <div class="flex items-center gap-1">
              <span class="quaternary--text--color">État</span>
              <select
                v-model="statusFilter"
                class="rounded-md border border-gray-300 bg-white px-2 py-1"
              >
                <option value="ALL">Toutes</option>
                <option value="UNREAD">Non lues</option>
                <option value="READ">Lues</option>
              </select>
            </div>

            <div class="flex items-center gap-1">
              <span class="quaternary--text--color">Type</span>
              <select
                v-model="typeFilter"
                class="rounded-md border border-gray-300 bg-white px-2 py-1"
              >
                <option value="ALL">Tous</option>
                <option value="INFO">Info</option>
                <option value="WARNING">Avertissement</option>
                <option value="ERROR">Erreur</option>
                <option value="SUCCESS">Succès</option>
              </select>
            </div>

            <div class="flex items-center gap-1">
              <span class="quaternary--text--color">Date</span>
              <select
                v-model="sortOrder"
                class="rounded-md border border-gray-300 bg-white px-2 py-1"
              >
                <option value="DESC">Plus récentes</option>
                <option value="ASC">Plus anciennes</option>
              </select>
            </div>
          </div>
        </div>

        <div class="max-h-[70vh] overflow-y-auto">
          <div v-if="isLoading" class="p-8 text-center">
            <p class="text-sm quaternary--text--color">Chargement des notifications...</p>
          </div>

          <div v-else-if="isError" class="p-8 text-center">
            <p class="text-sm text-red-500">
              Erreur lors du chargement des notifications.
            </p>
          </div>

          <div
            v-else-if="!notifications || notifications.length === 0"
            class="p-8 text-center"
          >
            <UIcon
              name="i-lucide-bell-off"
              class="h-12 w-12 mx-auto text-gray-300 mb-2"
            />
            <p class="text-sm quaternary--text--color">
              Vous n'avez aucune notification pour le moment.
            </p>
          </div>

          <div v-else class="divide-y divide-gray-100">
            <div
              v-for="notif in filteredNotifications"
              :key="notif.id"
              class="px-4 py-3 flex items-start gap-3"
              :class="!notif.lue ? 'bg-blue-50/40' : ''"
            >
              <div
                class="shrink-0 mt-1 h-2 w-2 rounded-full"
                :class="getTypeColor(notif.type)"
              ></div>
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <p
                    class="text-sm secondary--text--color"
                    :class="!notif.lue ? 'font-semibold' : ''"
                  >
                    {{ notif.titre }}
                  </p>
                  <span class="text-[11px] quaternary--text--color shrink-0">
                    {{ formatDate(notif.createdAt) }}
                  </span>
                </div>
                <p class="text-xs quaternary--text--color mt-1">
                  {{ notif.message }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

