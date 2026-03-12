export type StepStatus = "todo" | "in_progress" | "done" | "blocked";

export interface DemandeStep {
  id: string;
  label: string;
  icon?: string;
  dependsOn?: string[];
  defaultDescription?: string;
  defaultTodos?: { id: string; label: string; status: EtapeTodoStatus }[];
}

export type DemandeStepsConfig = Record<string, DemandeStep[]>;

export type BackendEtapeStatut = "A_FAIRE" | "EN_COURS" | "TERMINEE" | "BLOQUEE";

export type EtapeTodoStatus = "TODO" | "DONE" | "IGNORED";

export interface EtapeTodoItem {
  id: string;
  label: string;
  status: EtapeTodoStatus;
}

export interface DemandeEtapeDto {
  id: string;
  demandeId: string;
  stepCode: string;
  description: string;
  statut: BackendEtapeStatut;
  todos: unknown | null;
}

export function backendStatutToStepStatus(statut: BackendEtapeStatut): StepStatus {
  switch (statut) {
    case "TERMINEE":
      return "done";
    case "EN_COURS":
      return "in_progress";
    case "BLOQUEE":
      return "blocked";
    case "A_FAIRE":
    default:
      return "todo";
  }
}

export function stepStatusToBackendStatut(status: StepStatus): BackendEtapeStatut {
  switch (status) {
    case "done":
      return "TERMINEE";
    case "in_progress":
      return "EN_COURS";
    case "blocked":
      return "BLOQUEE";
    case "todo":
    default:
      return "A_FAIRE";
  }
}

export function normalizeEtapeTodos(raw: unknown): EtapeTodoItem[] {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    // Si c'est déjà un tableau d'EtapeTodoItem
    if (raw.length > 0 && typeof raw[0] === "object" && raw[0] !== null) {
      const first: any = raw[0];
      if ("id" in first && "label" in first && "status" in first) {
        return raw as EtapeTodoItem[];
      }
    }

    // Ancien format: tableau de chaînes
    if (raw.length > 0 && typeof raw[0] === "string") {
      return (raw as string[]).map((label) => ({
        id: label.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
        label,
        status: "TODO" as EtapeTodoStatus,
      }));
    }

    // Objet partiel: essayer de normaliser au mieux
    return (raw as any[]).map((item, idx) => {
      if (typeof item === "string") {
        return {
          id: item.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
          label: item,
          status: "TODO" as EtapeTodoStatus,
        };
      }
      const label = item?.label ?? `Élément ${idx + 1}`;
      const id =
        item?.id ??
        label.toLowerCase().replace(/[^a-z0-9]+/g, "_") ??
        `item_${idx}`;
      const status: EtapeTodoStatus =
        item?.status === "DONE" || item?.status === "IGNORED"
          ? item.status
          : "TODO";
      return { id, label, status };
    });
  }

  return [];
}

export function toggleTodoStatus(
  item: EtapeTodoItem,
  mode: "click" | "ignore",
): EtapeTodoItem {
  if (mode === "ignore") {
    return {
      ...item,
      status: item.status === "IGNORED" ? "TODO" : "IGNORED",
    };
  }

  // mode click: TODO <-> DONE, IGNORED reste IGNORED
  if (item.status === "DONE") {
    return { ...item, status: "TODO" };
  }
  if (item.status === "TODO") {
    return { ...item, status: "DONE" };
  }
  return item;
}

