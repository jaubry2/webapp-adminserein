<script setup lang="ts">
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
        <div class="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <p class="text-sm quaternary--text--color">
            {{ notifications?.length || 0 }} notification(s)
          </p>
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
              v-for="notif in notifications"
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

