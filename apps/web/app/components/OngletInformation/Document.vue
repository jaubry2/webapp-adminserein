<template>
  <div class="rounded-lg border border-gray-200 bg-white">
    <div
      class="flex w-full items-center justify-between border-b border-gray-200 px-6 py-4"
    >
      <h2 class="text-lg font-semibold secondary--text--color">Documents</h2>
      <button
        type="button"
        @click="documentsExpanded = !documentsExpanded"
        class="cursor-pointer"
      >
        <UIcon
          :name="documentsExpanded ? 'i-lucide-minus' : 'i-lucide-plus'"
          class="h-5 w-5 quaternary--text--color"
        />
      </button>
    </div>

    <div v-if="documentsExpanded" class="p-6">
      <!-- État de chargement -->
      <div v-if="isLoading" class="text-center py-8">
        <p class="text-sm quaternary--text--color">Chargement des documents...</p>
      </div>

      <!-- État d'erreur -->
      <div v-else-if="isError" class="text-center py-8">
        <p class="text-sm text-red-500">Erreur lors du chargement des documents.</p>
      </div>

      <!-- Aucun document -->
      <div v-else-if="!documents || documents.length === 0" class="text-center py-8">
        <p class="text-sm quaternary--text--color">Aucun document disponible.</p>
      </div>

      <!-- Liste des documents par catégorie -->
      <div v-else class="space-y-6">
        <div
          v-for="categorie in categories"
          :key="categorie"
          class="space-y-3"
        >
          <h3 class="text-sm font-semibold secondary--text--color uppercase tracking-wide">
            {{ getCategorieLabel(categorie) }}
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="doc in getDocumentsByCategorie(categorie)"
              :key="doc.id"
              class="group relative rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow cursor-pointer"
              @click="openDocumentViewer(doc)"
            >
              <!-- Icône du type de fichier -->
              <div class="flex items-start gap-3">
                <div class="flex-shrink-0">
                  <div
                    class="flex h-12 w-12 items-center justify-center rounded-lg"
                    :class="getFileTypeColor(doc.typeMime)"
                  >
                    <UIcon
                      :name="getFileIcon(doc.typeMime)"
                      class="h-6 w-6 text-white"
                    />
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium secondary--text--color truncate">
                    {{ doc.nom }}
                  </p>
                  <p v-if="doc.description" class="text-xs quaternary--text--color mt-1 line-clamp-2">
                    {{ doc.description }}
                  </p>
                  <p class="text-xs quaternary--text--color mt-1">
                    {{ formatDate(doc.createdAt) }} • {{ formatFileSize(doc.taille) }}
                  </p>
                </div>
              </div>

              <!-- Actions au survol -->
              <div
                class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2"
              >
                <button
                  @click.stop="openDocumentViewer(doc)"
                  type="button"
                  class="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-medium secondary--text--color shadow-sm hover:bg-gray-50 transition-colors"
                  title="Voir le document"
                >
                  <UIcon name="i-lucide-eye" class="h-4 w-4" />
                  Voir
                </button>
                <button
                  @click.stop="downloadDocument(doc)"
                  type="button"
                  class="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-medium secondary--text--color shadow-sm hover:bg-gray-50 transition-colors"
                  title="Télécharger"
                >
                  <UIcon name="i-lucide-download" class="h-4 w-4" />
                  Télécharger
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal pour visualiser le document -->
    <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="selectedDocument"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        @click.self="closeDocumentViewer"
      >
        <div class="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl m-4 flex flex-col">
          <!-- En-tête du modal -->
          <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-semibold secondary--text--color truncate">
                {{ selectedDocument.nom }}
              </h3>
              <p class="text-xs quaternary--text--color mt-1">
                {{ getCategorieLabel(selectedDocument.categorie) }} • {{ formatDate(selectedDocument.createdAt) }}
              </p>
            </div>
            <div class="flex items-center gap-2 ml-4">
              <button
                @click="downloadDocument(selectedDocument)"
                type="button"
                class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium secondary--text--color hover:bg-gray-50 transition-colors"
              >
                <UIcon name="i-lucide-download" class="h-4 w-4" />
                Télécharger
              </button>
              <button
                @click="closeDocumentViewer"
                type="button"
                class="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <UIcon name="i-lucide-x" class="h-6 w-6" />
              </button>
            </div>
          </div>

          <!-- Contenu du modal -->
          <div class="flex-1 overflow-auto p-6">
            <div v-if="isImage(selectedDocument.typeMime)" class="flex justify-center">
              <img
                :src="getDocumentUrl(selectedDocument)"
                :alt="selectedDocument.nom"
                class="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
            <div v-else-if="isPdf(selectedDocument.typeMime)" class="flex justify-center">
              <iframe
                :src="getDocumentUrl(selectedDocument)"
                class="w-full h-[70vh] rounded-lg border border-gray-200"
                frameborder="0"
              ></iframe>
            </div>
            <div v-else class="text-center py-12">
              <UIcon
                :name="getFileIcon(selectedDocument.typeMime)"
                class="h-16 w-16 mx-auto text-gray-400 mb-4"
              />
              <p class="text-sm quaternary--text--color mb-4">
                Aperçu non disponible pour ce type de fichier
              </p>
              <button
                @click="downloadDocument(selectedDocument)"
                type="button"
                class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                <UIcon name="i-lucide-download" class="h-4 w-4" />
                Télécharger le fichier
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { Document } from "~/types/document";

const props = defineProps<{
  patientId: string;
  documents?: Document[];
  isLoading?: boolean;
  isError?: boolean;
}>();

const documentsExpanded = ref(true);
const selectedDocument = ref<Document | null>(null);

// Obtenir toutes les catégories uniques
const categories = computed(() => {
  if (!props.documents || props.documents.length === 0) return [];
  const cats = new Set(
    props.documents.map((doc) => doc.categorie)
  );
  return Array.from(cats).sort();
});

// Obtenir les documents d'une catégorie
const getDocumentsByCategorie = (categorie: string) => {
  if (!props.documents) return [];
  return props.documents.filter((doc) => doc.categorie === categorie);
};

// Obtenir le label d'une catégorie
const getCategorieLabel = (categorie: string): string => {
  const labels: Record<string, string> = {
    IDENTITE: "Identité",
    MEDICAL: "Médical",
    ADMINISTRATIF: "Administratif",
    JURIDIQUE: "Juridique",
    LOGEMENT: "Logement",
    EMPLOI: "Emploi",
    AUTRE: "Autre",
  };
  return labels[categorie] || categorie;
};

// Obtenir l'icône selon le type MIME
const getFileIcon = (typeMime: string): string => {
  if (typeMime.startsWith("image/")) return "i-lucide-image";
  if (typeMime === "application/pdf") return "i-lucide-file-text";
  if (typeMime.includes("word")) return "i-lucide-file-text";
  if (typeMime.includes("excel") || typeMime.includes("spreadsheet")) return "i-lucide-file-spreadsheet";
  return "i-lucide-file";
};

// Obtenir la couleur selon le type MIME
const getFileTypeColor = (typeMime: string): string => {
  if (typeMime.startsWith("image/")) return "bg-blue-500";
  if (typeMime === "application/pdf") return "bg-red-500";
  if (typeMime.includes("word")) return "bg-blue-600";
  if (typeMime.includes("excel") || typeMime.includes("spreadsheet")) return "bg-green-600";
  return "bg-gray-500";
};

// Vérifier si c'est une image
const isImage = (typeMime: string): boolean => {
  return typeMime.startsWith("image/");
};

// Vérifier si c'est un PDF
const isPdf = (typeMime: string): boolean => {
  return typeMime === "application/pdf";
};

// Obtenir l'URL du document
const getDocumentUrl = (doc: Document): string => {
  // Encoder le chemin pour gérer les espaces et caractères spéciaux dans les noms de fichiers
  const parts = doc.cheminFichier.split("/");
  const filename = parts[parts.length - 1];
  const path = parts.slice(0, -1).join("/");
  return `${path}/${encodeURIComponent(filename)}`;
};

// Formater la date
const formatDate = (date: Date | string): string => {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Formater la taille du fichier
const formatFileSize = (size: string): string => {
  const bytes = parseInt(size, 10);
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
};

// Ouvrir le visualiseur de document
const openDocumentViewer = (doc: Document) => {
  selectedDocument.value = doc;
};

// Fermer le visualiseur
const closeDocumentViewer = () => {
  selectedDocument.value = null;
};

// Télécharger un document
const downloadDocument = (doc: Document) => {
  // Créer un lien de téléchargement
  const link = document.createElement("a");
  link.href = getDocumentUrl(doc);
  link.download = doc.nom;
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
