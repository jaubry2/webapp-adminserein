<script setup lang="ts">
const route = useRoute();
const { getPatientById, calculateAge } = await import("~/utils/patients");

const patientId = computed(() => Number(route.params.id));
const patient = computed(() => getPatientById(patientId.value));

if (!patient.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Patient non trouvé",
  });
}

const age = computed(() => {
  if (patient.value?.dateNaissance) {
    return calculateAge(patient.value.dateNaissance);
  }
  return null;
});

const activeTab = ref("information");
const identiteExpanded = ref(true);
const coordonneesExpanded = ref(true);

const tabs = [
  { id: "information", label: "Information", icon: "i-lucide-info" },
  { id: "document", label: "Document", icon: "i-lucide-file-text" },
  { id: "historique", label: "Historique", icon: "i-lucide-clock" },
  { id: "tache", label: "Tâche", icon: "i-lucide-check-square" },
];
</script>

<template>
  <div v-if="patient" class="min-h-screen bg-white font--text">
    <div class="flex">
      <!-- Contenu principal -->
      <div class="flex-1">
        <!-- En-tête du patient -->
        <header class="border-b border-gray-200 bg-white px-8 py-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold secondary--text--color font--title">
                {{ patient.nom.toUpperCase() }} {{ patient.prenom }}
                <span v-if="age" class="text-xl font-normal font--title">
                  ({{ age }} ans)
                </span>
              </h1>
            </div>
            <div>
              <div class="mt-2 flex items-center gap-6">
                <span class="text-sm quaternary--text--color">
                  Dossier n°{{ patient.dossierNumber }}
                </span>
              </div>
            </div>
          </div>

          <!-- Boutons Créer -->
          <div class="mt-6 flex items-center gap-4">
            <span class="text-sm font-medium secondary--text--color"
              >Créer :</span
            >
            <ButtonSecondary
              icon="i-lucide-plus"
              label="Nouvelle demande"
              bg_color="corail-soft-color"
              text_color="tertiary-color"
            />
            <ButtonSecondary
              icon="i-lucide-plus"
              label="Nouvel évènement"
              bg_color="sage-color"
              text_color="tertiary-color"
            />
            <ButtonSecondary
              icon="i-lucide-plus"
              label="Nouvel évènement"
              bg_color="mauve-brume-color"
              text_color="tertiary-color"
            />
          </div>
        </header>

        <!-- Contenu principal -->
        <main class="px-8 py-6">
          <!-- Onglets -->
          <div class="mb-6 flex items-center justify-between">
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

            <!-- Boutons Actions -->
            <div class="flex gap-2">
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium secondary--text--color transition-colors hover:bg-gray-50"
              >
                <UIcon name="i-lucide-printer" class="h-4 w-4" />
                Imprimer
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium secondary--text--color transition-colors hover:bg-gray-50"
              >
                <UIcon name="i-lucide-pencil" class="h-4 w-4" />
                Modifier
              </button>
            </div>
          </div>

          <!-- Contenu de l'onglet Information -->
          <div v-if="activeTab === 'information'" class="space-y-4">
            <!-- Section Identité -->
            <div class="rounded-lg border border-gray-200 bg-white">
              <button
                type="button"
                @click="identiteExpanded = !identiteExpanded"
                class="flex w-full items-center justify-between border-b border-gray-200 px-6 py-4 text-left"
              >
                <h2 class="text-lg font-semibold secondary--text--color">
                  Identité
                </h2>
                <UIcon
                  :name="identiteExpanded ? 'i-lucide-minus' : 'i-lucide-plus'"
                  class="h-5 w-5 quaternary--text--color"
                />
              </button>

              <div v-if="identiteExpanded" class="p-6">
                <div class="grid grid-cols-2 gap-6">
                  <!-- Colonne gauche -->
                  <div class="space-y-4">
                    <div>
                      <span class="text-sm quaternary--text--color">Nom :</span>
                      <p class="mt-1 font-semibold secondary--text--color">
                        {{ patient.nom }}
                      </p>
                    </div>
                    <div>
                      <span class="text-sm quaternary--text--color"
                        >Prénom :</span
                      >
                      <p class="mt-1 font-semibold secondary--text--color">
                        {{ patient.prenom }}
                      </p>
                    </div>
                    <div>
                      <span class="text-sm quaternary--text--color"
                        >Sexe :</span
                      >
                      <p class="mt-1 font-semibold secondary--text--color">
                        {{ patient.sexe || "Non renseigné" }}
                      </p>
                    </div>
                    <div>
                      <span class="text-sm quaternary--text--color"
                        >Lieu de naissance :</span
                      >
                      <p class="mt-1 font-semibold secondary--text--color">
                        {{ patient.lieuNaissance || "Non renseigné" }}
                      </p>
                    </div>
                    <div>
                      <span class="text-sm quaternary--text--color"
                        >Pays de naissance :</span
                      >
                      <p class="mt-1 font-semibold secondary--text--color">
                        {{ patient.paysNaissance || "Non renseigné" }}
                      </p>
                    </div>
                  </div>

                  <!-- Colonne droite -->
                  <div class="space-y-4">
                    <div>
                      <span class="text-sm quaternary--text--color"
                        >Nom de naissance :</span
                      >
                      <p class="mt-1 font-semibold secondary--text--color">
                        {{ patient.nomNaissance || patient.nom }}
                      </p>
                    </div>
                    <div>
                      <span class="text-sm quaternary--text--color"
                        >Autres prénoms :</span
                      >
                      <p class="mt-1 font-semibold secondary--text--color">
                        {{ patient.autresPrenoms || "Aucun" }}
                      </p>
                    </div>
                    <div>
                      <span class="text-sm quaternary--text--color"
                        >Date de naissance :</span
                      >
                      <p class="mt-1 font-semibold secondary--text--color">
                        {{ patient.dateNaissance }}
                      </p>
                    </div>
                    <div>
                      <span class="text-sm quaternary--text--color"
                        >Département de naissance :</span
                      >
                      <p class="mt-1 font-semibold secondary--text--color">
                        {{ patient.departementNaissance || "Non renseigné" }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section Coordonnées -->
            <div class="rounded-lg border border-gray-200 bg-white">
              <button
                type="button"
                @click="coordonneesExpanded = !coordonneesExpanded"
                class="flex w-full items-center justify-between border-b border-gray-200 px-6 py-4 text-left"
              >
                <h2 class="text-lg font-semibold secondary--text--color">
                  Coordonnées
                </h2>
                <UIcon
                  :name="
                    coordonneesExpanded ? 'i-lucide-minus' : 'i-lucide-plus'
                  "
                  class="h-5 w-5 quaternary--text--color"
                />
              </button>

              <div v-if="coordonneesExpanded" class="p-6">
                <div class="space-y-4">
                  <div>
                    <span class="text-sm quaternary--text--color"
                      >Numéro de téléphone :</span
                    >
                    <p class="mt-1 font-semibold secondary--text--color">
                      {{ patient.telephone || "Non renseigné" }}
                    </p>
                  </div>
                  <div>
                    <span class="text-sm quaternary--text--color"
                      >Adresse mail :</span
                    >
                    <p class="mt-1 font-semibold secondary--text--color">
                      {{ patient.email || "Non renseigné" }}
                    </p>
                  </div>
                  <div v-if="patient.adresse">
                    <span class="text-sm quaternary--text--color"
                      >Adresse :</span
                    >
                    <p class="mt-1 font-semibold secondary--text--color">
                      {{ patient.adresse }}, {{ patient.codePostal }}
                      {{ patient.ville }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Contenu des autres onglets -->
          <div
            v-else
            class="rounded-lg border border-gray-200 bg-white p-8 text-center"
          >
            <p class="text-sm quaternary--text--color">
              Contenu de l'onglet "{{
                tabs.find((t) => t.id === activeTab)?.label
              }}" à venir
            </p>
          </div>
        </main>
      </div>

      <!-- Panneau Sommaire -->
      <aside
        class="w-64 border-l border-gray-200 bg-tertiary p-6"
        style="background-color: var(--tertiary-color)"
      >
        <h3 class="mb-4 text-lg font-semibold secondary--text--color">
          Sommaire
        </h3>
        <nav class="space-y-2">
          <a
            href="#identite"
            class="block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/50"
            :class="
              identiteExpanded
                ? 'bg-white/50 font-medium secondary--text--color'
                : 'quaternary--text--color'
            "
            @click.prevent="identiteExpanded = true"
          >
            Identité
          </a>
          <a
            href="#coordonnees"
            class="block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/50"
            :class="
              coordonneesExpanded
                ? 'bg-white/50 font-medium secondary--text--color'
                : 'quaternary--text--color'
            "
            @click.prevent="coordonneesExpanded = true"
          >
            Coordonnées
          </a>
        </nav>
      </aside>
    </div>
  </div>
</template>
