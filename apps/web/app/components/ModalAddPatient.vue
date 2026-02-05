<template>
  <!-- Overlay avec blur (tout sauf la sidebar à gauche) -->
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
      >
        <!-- Overlay avec blur : à droite de la sidebar (w-64 = 256px), clics actifs pour fermer -->
        <div
          class="pointer-events-auto absolute top-0 right-0 bottom-0 left-64 bg-white/30 backdrop-blur-sm"
          @click="closeModal"
        ></div>

        <!-- Modal : clics actifs, bordure secondary -->
        <div
          class="pointer-events-auto relative z-10 w-full max-w-2xl max-h-[90vh] rounded-lg border-2 tertiary--background--color secondary--border--color shadow-xl flex flex-col"
          @click.stop
        >
          <!-- En-tête du modal -->
          <div
            class="flex items-center justify-between border-b border-gray-200 px-6 py-4"
          >
            <h2
              class="text-xl font-semibold secondary--text--color font--title"
            >
              Ajouter un patient
            </h2>
            <button
              @click="closeModal"
              class="text-red-500 hover:text-red-700 transition-colors"
              type="button"
            >
              <UIcon name="i-lucide-x" class="h-6 w-6" />
            </button>
          </div>

          <!-- Contenu du modal -->
          <div class="px-6 py-6 overflow-y-auto flex-1">
            <!-- Première question -->
            <div class="mb-6">
              <label
                class="mb-3 block text-sm font-medium secondary--text--color"
              >
                Vous connaissez le numéro de dossier :
              </label>
              <div class="flex gap-2">
                <button
                  @click="connaitDossierNumber = true; errorMessage = ''"
                  type="button"
                  class="flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
                  :class="
                    connaitDossierNumber
                      ? 'border-[#2e3a45] text-[#2e3a45] bg-[#a7c7e7]'
                      : 'border-gray-300 bg-white text-gray-700 tertiary--background--color'
                  "
                  :style="
                    connaitDossierNumber
                      ? {
                          backgroundColor: 'rgba(167, 199, 231, 0.1)',
                        }
                      : {}
                  "
                >
                  Oui
                </button>
                <button
                  @click="connaitDossierNumber = false; errorMessage = ''"
                  type="button"
                  class="flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
                  :class="
                    !connaitDossierNumber
                      ? 'border-[#2e3a45] text-[#2e3a45] bg-[#a7c7e7]'
                      : 'border-gray-300 bg-white text-gray-700 tertiary--background--color'
                  "
                  :style="
                    !connaitDossierNumber
                      ? {
                          backgroundColor: 'rgba(167, 199, 231, 0.1)',
                        }
                      : {}
                  "
                >
                  Non
                </button>
              </div>
            </div>

            <!-- Champ numéro de dossier (si Oui) -->
            <div v-if="connaitDossierNumber" class="mb-6 space-y-4">
              <div>
                <label
                  for="dossier-number"
                  class="mb-2 block text-sm font-medium secondary--text--color"
                >
                  Numéro de dossier du patient :
                </label>
                <input
                  id="dossier-number"
                  v-model="formData.dossierNumber"
                  type="text"
                  placeholder="Entrez le numéro de dossier"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 input-focus-primary"
                  :class="errorMessage ? 'border-red-500' : ''"
                />
              </div>

              <!-- Message d'erreur si numéro invalide -->
              <div v-if="displayedError" class="rounded-lg border border-red-200 bg-red-50 p-4">
                <p class="mb-2 text-sm text-red-800">{{ displayedError }}</p>
                <button
                  @click="connaitDossierNumber = false; errorMessage = ''"
                  type="button"
                  class="text-sm font-medium text-red-600 underline hover:text-red-800"
                >
                  Je ne connais pas le numéro de dossier
                </button>
              </div>
            </div>

            <!-- Séparateur -->
            <div
              v-if="!connaitDossierNumber"
              class="mb-6 border-t border-gray-200"
            ></div>

            <!-- Deuxième question (si Non à la première) -->
            <div v-if="!connaitDossierNumber" class="mb-6">
              <label
                class="mb-3 block text-sm font-medium secondary--text--color"
              >
                Le patient a un dossier :
              </label>
              <div class="flex gap-2">
                <button
                  @click="patientADossier = 'oui'"
                  type="button"
                  class="flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
                  :class="
                    patientADossier === 'oui'
                      ? 'primary--border--color primary--text--color'
                      : 'border-gray-300 bg-white text-gray-700 tertiary--background--color'
                  "
                  :style="
                    patientADossier === 'oui'
                      ? {
                          backgroundColor: 'rgba(167, 199, 231, 0.1)',
                        }
                      : {}
                  "
                >
                  Oui
                </button>
                <button
                  @click="patientADossier = 'je-sais-pas'"
                  type="button"
                  class="flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
                  :class="
                    patientADossier === 'je-sais-pas'
                      ? 'primary--border--color primary--text--color'
                      : 'border-gray-300 bg-white text-gray-700 tertiary--background--color'
                  "
                  :style="
                    patientADossier === 'je-sais-pas'
                      ? {
                          backgroundColor: 'rgba(167, 199, 231, 0.1)',
                        }
                      : {}
                  "
                >
                  Je sais pas
                </button>
                <button
                  @click="patientADossier = 'non'"
                  type="button"
                  class="flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
                  :class="
                    patientADossier === 'non'
                      ? 'primary--border--color primary--text--color'
                      : 'border-gray-300 bg-white text-gray-700 tertiary--background--color'
                  "
                  :style="
                    patientADossier === 'non'
                      ? {
                          backgroundColor: 'rgba(167, 199, 231, 0.1)',
                        }
                      : {}
                  "
                >
                  Non
                </button>
              </div>
            </div>

            <!-- Formulaire de recherche (si patient a un dossier mais on ne connaît pas le numéro) -->
            <div v-if="!connaitDossierNumber && patientADossier === 'oui'" class="space-y-4">
              <div class="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p class="text-sm text-blue-800">
                  Veuillez remplir les informations suivantes pour rechercher le patient dans le système :
                </p>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label
                    for="search-date-naissance"
                    class="mb-2 block text-sm font-medium secondary--text--color"
                  >
                    Date de naissance <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="search-date-naissance"
                    v-model="formData.dateNaissance"
                    type="date"
                    required
                    class="w-full rounded-lg border border-gray-300 px-4 py-2 input-focus-primary"
                  />
                </div>

                <div>
                  <label
                    for="search-prenom"
                    class="mb-2 block text-sm font-medium secondary--text--color"
                  >
                    Prénom <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="search-prenom"
                    v-model="formData.prenom"
                    type="text"
                    placeholder="Prénom"
                    required
                    class="w-full rounded-lg border border-gray-300 px-4 py-2 input-focus-primary"
                  />
                </div>

                <div>
                  <label
                    for="search-nom"
                    class="mb-2 block text-sm font-medium secondary--text--color"
                  >
                    Nom <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="search-nom"
                    v-model="formData.nomUsage"
                    type="text"
                    placeholder="Nom d'usage ou nom de naissance"
                    required
                    class="w-full rounded-lg border border-gray-300 px-4 py-2 input-focus-primary"
                  />
                </div>

                <div>
                  <label
                    for="search-numero-secu"
                    class="mb-2 block text-sm font-medium secondary--text--color"
                  >
                    Numéro de sécurité sociale <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="search-numero-secu"
                    v-model="formData.numeroSecuriteSociale"
                    type="text"
                    placeholder="13 chiffres"
                    required
                    class="w-full rounded-lg border border-gray-300 px-4 py-2 input-focus-primary"
                  />
                </div>
              </div>
            </div>

            <!-- Champs de formulaire complets (si pas de dossier ou je ne sais pas) -->
            <div v-if="!connaitDossierNumber && (patientADossier === 'non' || patientADossier === 'je-sais-pas')" class="space-y-4">
              <!-- Section Identité -->
              <div class="border-b border-gray-200 pb-4">
                <h3 class="mb-4 text-lg font-semibold secondary--text--color">
                  Identité
                </h3>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      for="nom-usage"
                      class="mb-2 block text-sm font-medium secondary--text--color"
                    >
                      Nom d'usage <span class="text-red-500">*</span>
                    </label>
                    <input
                      id="nom-usage"
                      v-model="formData.nomUsage"
                      type="text"
                      placeholder="Nom d'usage"
                      required
                      class="w-full rounded-lg border border-gray-300 px-4 py-2 input-focus-primary"
                    />
                  </div>

                  <div>
                    <label
                      for="nom-naissance"
                      class="mb-2 block text-sm font-medium secondary--text--color"
                    >
                      Nom de naissance <span class="text-red-500">*</span>
                    </label>
                    <input
                      id="nom-naissance"
                      v-model="formData.nomNaissance"
                      type="text"
                      placeholder="Nom de naissance"
                      required
                      class="w-full rounded-lg border border-gray-300 px-4 py-2 input-focus-primary"
                    />
                  </div>

                  <div>
                    <label
                      for="prenom"
                      class="mb-2 block text-sm font-medium secondary--text--color"
                    >
                      Prénom <span class="text-red-500">*</span>
                    </label>
                    <input
                      id="prenom"
                      v-model="formData.prenom"
                      type="text"
                      placeholder="Prénom"
                      required
                      class="w-full rounded-lg border border-gray-300 px-4 py-2 input-focus-primary"
                    />
                  </div>

                  <div>
                    <label
                      for="autres-prenoms"
                      class="mb-2 block text-sm font-medium secondary--text--color"
                    >
                      Autres prénoms (séparés par des virgules)
                    </label>
                    <input
                      id="autres-prenoms"
                      v-model="formData.autresPrenoms"
                      type="text"
                      placeholder="Ex: Marie, Claire"
                      class="w-full rounded-lg border border-gray-300 px-4 py-2 input-focus-primary"
                    />
                  </div>

                  <div>
                    <label
                      for="genre"
                      class="mb-2 block text-sm font-medium secondary--text--color"
                    >
                      Genre <span class="text-red-500">*</span>
                    </label>
                    <select
                      id="genre"
                      v-model="formData.genre"
                      required
                      class="w-full rounded-lg border border-gray-300 px-4 py-2 input-focus-primary"
                    >
                      <option value="">Sélectionner</option>
                      <option value="MASCULIN">Masculin</option>
                      <option value="FEMININ">Féminin</option>
                      <option value="AUTRE">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label
                      for="date-naissance"
                      class="mb-2 block text-sm font-medium secondary--text--color"
                    >
                      Date de naissance <span class="text-red-500">*</span>
                    </label>
                    <input
                      id="date-naissance"
                      v-model="formData.dateNaissance"
                      type="date"
                      required
                      class="w-full rounded-lg border border-gray-300 px-4 py-2 input-focus-primary"
                    />
                  </div>
                </div>
              </div>

              <!-- Section Naissance -->
              <div class="border-b border-gray-200 pb-4">
                <h3 class="mb-4 text-lg font-semibold secondary--text--color">
                  Naissance
                </h3>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      for="ville-naissance"
                      class="mb-2 block text-sm font-medium secondary--text--color"
                    >
                      Ville de naissance <span class="text-red-500">*</span>
                    </label>
                    <input
                      id="ville-naissance"
                      v-model="formData.villeNaissance"
                      type="text"
                      placeholder="Ville"
                      required
                      class="w-full rounded-lg border border-gray-300 px-4 py-2 input-focus-primary"
                    />
                  </div>

                  <div>
                    <label
                      for="departement-naissance"
                      class="mb-2 block text-sm font-medium secondary--text--color"
                    >
                      Département de naissance <span class="text-red-500">*</span>
                    </label>
                    <input
                      id="departement-naissance"
                      v-model="formData.departementNaissance"
                      type="text"
                      placeholder="Ex: 75, 69"
                      required
                      class="w-full rounded-lg border border-gray-300 px-4 py-2 input-focus-primary"
                    />
                  </div>

                  <div>
                    <label
                      for="pays-naissance"
                      class="mb-2 block text-sm font-medium secondary--text--color"
                    >
                      Pays de naissance <span class="text-red-500">*</span>
                    </label>
                    <input
                      id="pays-naissance"
                      v-model="formData.paysNaissance"
                      type="text"
                      placeholder="Pays"
                      required
                      class="w-full rounded-lg border border-gray-300 px-4 py-2 input-focus-primary"
                    />
                  </div>

                  <div>
                    <label
                      for="nationalites"
                      class="mb-2 block text-sm font-medium secondary--text--color"
                    >
                      Nationalités (séparées par des virgules)
                    </label>
                    <input
                      id="nationalites"
                      v-model="formData.nationalites"
                      type="text"
                      placeholder="Ex: Française, Espagnole"
                      class="w-full rounded-lg border border-gray-300 px-4 py-2 input-focus-primary"
                    />
                  </div>
                </div>
              </div>

              <!-- Section Autres informations -->
              <div class="border-b border-gray-200 pb-4">
                <h3 class="mb-4 text-lg font-semibold secondary--text--color">
                  Autres informations
                </h3>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      for="numero-secu"
                      class="mb-2 block text-sm font-medium secondary--text--color"
                    >
                      Numéro de sécurité sociale <span class="text-red-500">*</span>
                    </label>
                    <input
                      id="numero-secu"
                      v-model="formData.numeroSecuriteSociale"
                      type="text"
                      placeholder="13 chiffres"
                      required
                      class="w-full rounded-lg border border-gray-300 px-4 py-2 input-focus-primary"
                    />
                  </div>

                  <div>
                    <label
                      for="situation-familiale"
                      class="mb-2 block text-sm font-medium secondary--text--color"
                    >
                      Situation familiale <span class="text-red-500">*</span>
                    </label>
                    <select
                      id="situation-familiale"
                      v-model="formData.situationFamiliale"
                      required
                      class="w-full rounded-lg border border-gray-300 px-4 py-2 input-focus-primary"
                    >
                      <option value="">Sélectionner</option>
                      <option value="CELIBATAIRE">Célibataire</option>
                      <option value="MARIE">Marié(e)</option>
                      <option value="DIVORCE">Divorcé(e)</option>
                      <option value="VEUF">Veuf(ve)</option>
                      <option value="PACSE">Pacsé(e)</option>
                      <option value="CONCUBINAGE">Concubinage</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- Bouton de validation -->
          <div class="border-t border-gray-200 px-6 py-4">
            <button
              @click="handleSubmit"
              type="button"
              :disabled="props.isLoading"
              class="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style="background-color: var(--primary-color)"
            >
              <span v-if="props.isLoading">
                <span v-if="connaitDossierNumber">Ajout en cours...</span>
                <span v-else-if="!connaitDossierNumber && patientADossier === 'oui'">Recherche en cours...</span>
                <span v-else>Création en cours...</span>
              </span>
              <span v-else>
                <span v-if="connaitDossierNumber">Ajouter à ma liste</span>
                <span v-else-if="!connaitDossierNumber && patientADossier === 'oui'">Rechercher</span>
                <span v-else>Créer le patient</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean;
  isLoading?: boolean;
  errorMessage?: string;
}>();

// Exposer l'erreur pour l'afficher dans le template
const displayedError = computed(() => props.errorMessage || errorMessage.value);

const emit = defineEmits<{
  close: [];
  submit: [
    data: {
      dossierNumber?: string;
      nomUsage?: string;
      nomNaissance?: string;
      prenom?: string;
      autresPrenoms?: string;
      genre?: string;
      dateNaissance?: string;
      villeNaissance?: string;
      departementNaissance?: string;
      paysNaissance?: string;
      nationalites?: string;
      numeroSecuriteSociale?: string;
      situationFamiliale?: string;
      connaitDossierNumber: boolean;
      patientADossier?: "oui" | "je-sais-pas" | "non";
      searchMode?: boolean; // true si recherche par infos, false si création
    }
  ];
}>();

const connaitDossierNumber = ref(true);
const patientADossier = ref<"oui" | "je-sais-pas" | "non">("non");
const errorMessage = ref("");

const formData = ref({
  dossierNumber: "",
  nomUsage: "",
  nomNaissance: "",
  prenom: "",
  autresPrenoms: "",
  genre: "",
  dateNaissance: "",
  villeNaissance: "",
  departementNaissance: "",
  paysNaissance: "",
  nationalites: "",
  numeroSecuriteSociale: "",
  situationFamiliale: "",
});

const closeModal = () => {
  emit("close");
  // Reset form
  connaitDossierNumber.value = true;
  patientADossier.value = "non";
  errorMessage.value = "";
  formData.value = {
    dossierNumber: "",
    nomUsage: "",
    nomNaissance: "",
    prenom: "",
    autresPrenoms: "",
    genre: "",
    dateNaissance: "",
    villeNaissance: "",
    departementNaissance: "",
    paysNaissance: "",
    nationalites: "",
    numeroSecuriteSociale: "",
    situationFamiliale: "",
  };
};

const toast = useToast();

const handleSubmit = () => {
  // Cas 1 : Connaît le numéro de dossier
  if (connaitDossierNumber.value) {
    if (!formData.value.dossierNumber) {
      toast.add({
        title: "Erreur de validation",
        description: "Veuillez entrer un numéro de dossier",
        color: "error",
      });
      return;
    }
    emit("submit", {
      dossierNumber: formData.value.dossierNumber,
      connaitDossierNumber: true,
    });
    closeModal();
    return;
  }

  // Cas 2 : Recherche par informations (patient a un dossier mais on ne connaît pas le numéro)
  if (patientADossier.value === "oui") {
    if (
      !formData.value.dateNaissance ||
      !formData.value.prenom ||
      !formData.value.nomUsage ||
      !formData.value.numeroSecuriteSociale
    ) {
      toast.add({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs de recherche",
        color: "error",
      });
      return;
    }
    emit("submit", {
      dateNaissance: formData.value.dateNaissance,
      prenom: formData.value.prenom,
      nomUsage: formData.value.nomUsage,
      numeroSecuriteSociale: formData.value.numeroSecuriteSociale,
      connaitDossierNumber: false,
      patientADossier: "oui",
      searchMode: true,
    });
    closeModal();
    return;
  }

  // Cas 3 : Création d'un nouveau patient (pas de dossier ou je ne sais pas)
  if (
    !formData.value.nomUsage ||
    !formData.value.nomNaissance ||
    !formData.value.prenom ||
    !formData.value.genre ||
    !formData.value.dateNaissance ||
    !formData.value.villeNaissance ||
    !formData.value.departementNaissance ||
    !formData.value.paysNaissance ||
    !formData.value.numeroSecuriteSociale ||
    !formData.value.situationFamiliale
  ) {
    toast.add({
      title: "Erreur de validation",
      description: "Veuillez remplir tous les champs obligatoires",
      color: "error",
    });
    return;
  }

  emit("submit", {
    nomUsage: formData.value.nomUsage,
    nomNaissance: formData.value.nomNaissance,
    prenom: formData.value.prenom,
    autresPrenoms: formData.value.autresPrenoms,
    genre: formData.value.genre,
    dateNaissance: formData.value.dateNaissance,
    villeNaissance: formData.value.villeNaissance,
    departementNaissance: formData.value.departementNaissance,
    paysNaissance: formData.value.paysNaissance,
    nationalites: formData.value.nationalites,
    numeroSecuriteSociale: formData.value.numeroSecuriteSociale,
    situationFamiliale: formData.value.situationFamiliale,
    connaitDossierNumber: false,
    patientADossier: patientADossier.value,
    searchMode: false,
  });
  closeModal();
};
</script>

<style scoped>
/* Animation d'entrée/sortie du modal */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  opacity: 0;
  transform: scale(0.95);
}
</style>
