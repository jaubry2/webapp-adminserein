export interface Notification {
  id: string;
  professionnelId: string | null;
  patientId: string | null;
  type: "INFO" | "WARNING" | "ERROR" | "SUCCESS";
  titre: string;
  message: string;
  lue: boolean;
  lien: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}
