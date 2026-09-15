import type { TaskPriority } from "@/types/crm";

export const taskPriorities: Array<{ id: TaskPriority; label: string }> = [
  { id: "normal", label: "Normal" },
  { id: "high", label: "Alta" },
  { id: "urgent", label: "Urgente" },
  { id: "low", label: "Baixa" },
];
