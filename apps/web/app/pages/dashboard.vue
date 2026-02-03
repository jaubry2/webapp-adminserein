<script setup lang="ts">
const { $authClient } = useNuxtApp();

definePageMeta({
  middleware: ["auth"],
});

const session = $authClient.useSession();

const tasks = [
  {
    id: 1,
    label: "Démarche - Demande d'APL",
    patientName: "Aubry Jules",
    date: "25/12/2025",
    accentColor: "peach",
    statusLabel: "Accepter",
  },
  {
    id: 2,
    label: "Synthèse d’entretien",
    patientName: "Aubry Jules",
    date: "25/12/2025",
    accentColor: "lavender",
  },
];
</script>

<template>
  <div class="min-h-svh px-10 py-10">
    <div class="mx-auto max-w-5xl space-y-10">
      <header class="space-y-2">
        <p class="text-sm text-slate-500">
          Bonjour
          <span class="font-medium text-slate-700">
            {{
              session?.data?.user?.name ||
                session?.data?.user?.email ||
                "utilisateur"
            }}
          </span>
        </p>
      </header>

      <section>
        <div
          class="flex h-56 items-center justify-center rounded-3xl bg-[#d7d9dd]"
        >
          <p class="text-2xl font-semibold text-slate-800">
            Nouveautés sur application
          </p>
        </div>
      </section>

      <section class="space-y-4">
        <TaskCard
          v-for="task in tasks"
          :key="task.id"
          v-bind="task"
        />
      </section>
    </div>
  </div>
</template>
