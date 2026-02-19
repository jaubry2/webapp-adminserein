import type { Patient } from "./patient";

export interface Particulier {
  id: string;
  userId: string;
  patientId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  patient?: Patient;
  user?: {
    id: string;
    name: string;
    email: string;
    type: "PROFESSIONNEL" | "PARTICULIER" | null;
  };
}
