<script setup></script>

<template>
  <div class="h-svh flex tertiary--background--color text-slate-900">
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
        <ButtonLayout icon="i-lucide-users" label="Liste des patients" />
        <ButtonLayout icon="i-lucide-clipboard-list" label="Tâche à faire" />
        <ButtonLayout icon="i-lucide-file-plus-2" label="Faire une demande" />
      </div>

      <div class="space-y-4 h-[15%]">
        <div class="h-px w-full bg-white/70" />
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div
              class="flex h-9 w-9 items-center justify-center rounded-full bg-[#e3efff]"
            >
              <UIcon
                name="i-lucide-user-round"
                class="h-4 w-4 text-slate-700"
              />
            </div>
            <div class="text-xs leading-tight">
              <p class="font-semibold">Profil</p>
              <p class="text-slate-700/80">Paramètres et compte</p>
            </div>
          </div>

          <div class="flex flex-col items-center gap-3 text-slate-800">
            <button type="button" class="hover:text-slate-950 transition">
              <UIcon name="i-lucide-settings-2" class="h-5 w-5" />
            </button>
            <button type="button" class="hover:text-slate-950 transition">
              <UIcon name="i-lucide-log-out" class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </aside>

    <UMain class="flex-1 overflow-y-auto">
      <slot />
    </UMain>
  </div>
</template>
