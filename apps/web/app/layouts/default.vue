<script setup></script>

<template>
  <div class="h-svh flex bg-[#f4f7fb] text-slate-900">
    <aside
      class="w-64 bg-[#b7d3f1] flex flex-col justify-between py-8 px-6 shadow-[4px_0_12px_rgba(15,23,42,0.06)]"
    >
      <div>
        <div class="text-2xl font-semibold leading-tight tracking-tight">
          Admin
          <br />
          Serein
        </div>

        <nav class="mt-10 space-y-3 text-sm font-medium">
          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-full bg-white/90 px-4 py-2.5 shadow-sm hover:bg-white transition"
          >
            <span
              class="flex h-8 w-8 items-center justify-center rounded-full bg-[#e3efff]"
            >
              <UIcon name="i-lucide-users" class="h-4 w-4 text-slate-700" />
            </span>
            <span>Liste des patients</span>
          </button>

          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-full bg-[#c4d9f3] px-4 py-2.5 hover:bg-[#bed3ed] transition"
          >
            <span
              class="flex h-8 w-8 items-center justify-center rounded-full bg-[#e3efff]"
            >
              <UIcon
                name="i-lucide-clipboard-list"
                class="h-4 w-4 text-slate-700"
              />
            </span>
            <span>Tâche à faire</span>
          </button>

          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-full bg-[#c4d9f3] px-4 py-2.5 hover:bg-[#bed3ed] transition"
          >
            <span
              class="flex h-8 w-8 items-center justify-center rounded-full bg-[#e3efff]"
            >
              <UIcon
                name="i-lucide-file-plus-2"
                class="h-4 w-4 text-slate-700"
              />
            </span>
            <span>Faire une demande</span>
          </button>
        </nav>
      </div>

      <div class="space-y-4">
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
