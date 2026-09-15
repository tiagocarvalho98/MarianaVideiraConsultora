import type { Task } from "@/types/crm";
import { daysAgo, daysFromNow, laterToday, tomorrowAt, yesterdayAt } from "./date";

const marianaId = "10000000-0000-4000-8000-000000000001";
const tiagoId = "10000000-0000-4000-8000-000000000002";

const taskSpecs = [
  ["004", "Enviar selecao de imoveis", yesterdayAt(16, 0), null, "high", marianaId],
  ["003", "Primeira chamada", laterToday(60), null, "normal", tiagoId],
  ["005", "Reuniao de avaliacao", laterToday(120), null, "urgent", marianaId],
  ["007", "Enviar resumo de procura", tomorrowAt(10, 30), null, "normal", tiagoId],
  ["008", "Confirmar visita", daysFromNow(3), null, "high", marianaId],
  ["009", "Acompanhar resposta a proposta", tomorrowAt(9, 30), null, "high", tiagoId],
  ["010", "Preparar documentos CPCV", daysFromNow(5), null, "urgent", marianaId],
  ["011", "Rever condicoes de angariacao", laterToday(90), null, "high", marianaId],
  ["012", "Atualizar plano de comercializacao", daysFromNow(2), null, "normal", tiagoId],
  ["015", "Validar data de escritura", daysFromNow(6), null, "urgent", tiagoId],
  ["016", "Confirmar escritura realizada", daysAgo(1), daysAgo(1), "normal", marianaId],
] as const;

export const mockTasks: Task[] = taskSpecs.map(
  ([opportunitySuffix, title, dueAt, completedAt, priority, assignedTo], index) => ({
    id: `50000000-0000-4000-8000-000000000${String(index + 1).padStart(3, "0")}`,
    opportunityId: `40000000-0000-4000-8000-000000000${opportunitySuffix}`,
    assignedTo,
    title,
    dueAt,
    completedAt,
    priority,
    createdAt: daysAgo(index + 1),
    updatedAt: completedAt ?? daysAgo(index + 1),
  }),
);
