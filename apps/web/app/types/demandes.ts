export type StepStatus = "todo" | "in_progress" | "done" | "blocked";

export interface DemandeStep {
  id: string;
  label: string;
  icon?: string;
  dependsOn?: string[];
}

export type DemandeStepsConfig = Record<string, DemandeStep[]>;

export type BackendEtapeStatut = "A_FAIRE" | "EN_COURS" | "TERMINEE" | "BLOQUEE";

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

