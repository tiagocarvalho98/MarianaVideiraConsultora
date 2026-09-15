import type { Activity, ActivityType } from "@/types/crm";
import { daysAgo, hoursAgo, minutesAgo } from "./date";
import { mockOpportunities } from "./opportunities";

const activityTitles: Record<ActivityType, string> = {
  form_submission: "Formulario recebido",
  stage_changed: "Estado alterado",
  call: "Chamada registada",
  meeting: "Reuniao registada",
  note: "Nota adicionada",
  task_created: "Tarefa criada",
  task_completed: "Tarefa concluida",
  lost: "Oportunidade marcada como perdida",
};

function createActivity(
  sequence: number,
  opportunityId: string,
  type: ActivityType,
  occurredAt: string,
  body: string | null,
  metadata: Record<string, string | number | boolean | null> = {},
  userId: string | null = null,
): Activity {
  return {
    id: `60000000-0000-4000-8000-${String(sequence).padStart(12, "0")}`,
    opportunityId,
    userId,
    type,
    title: activityTitles[type],
    body,
    metadata,
    occurredAt,
    createdAt: occurredAt,
  };
}

const marianaId = "10000000-0000-4000-8000-000000000001";
const tiagoId = "10000000-0000-4000-8000-000000000002";

export const mockActivities: Activity[] = mockOpportunities.flatMap((opportunity, index) => {
  const base = index * 10;
  const owner = opportunity.assignedTo ?? (index % 2 === 0 ? marianaId : tiagoId);
  const activities: Activity[] = [
    createActivity(
      base + 1,
      opportunity.id,
      "form_submission",
      opportunity.createdAt,
      opportunity.type === "buyer"
        ? "Pedido de acompanhamento para compra recebido pelo website."
        : "Pedido de contacto para venda recebido pelo website.",
      { source_id: opportunity.sourceId },
    ),
  ];

  if (opportunity.firstContactAt) {
    activities.push(
      createActivity(
        base + 2,
        opportunity.id,
        "call",
        opportunity.firstContactAt,
        "Primeiro contacto realizado e contexto inicial confirmado.",
        {},
        owner,
      ),
      createActivity(
        base + 3,
        opportunity.id,
        "stage_changed",
        hoursAgo(Math.max(1, 48 - index)),
        "Oportunidade avancou apos qualificacao.",
        { from: "por_contactar", to: opportunity.stage },
        owner,
      ),
    );
  }

  if (opportunity.stage.includes("reuniao") || opportunity.stage === "visitas") {
    activities.push(
      createActivity(
        base + 4,
        opportunity.id,
        "meeting",
        opportunity.lastActivityAt ?? hoursAgo(12),
        "Reuniao ou visita registada com proximos passos definidos.",
        { location: opportunity.location },
        owner,
      ),
    );
  }

  if (opportunity.nextActionAt) {
    activities.push(
      createActivity(
        base + 5,
        opportunity.id,
        "task_created",
        opportunity.lastActivityAt ?? hoursAgo(6),
        "Proxima acao criada para manter acompanhamento ativo.",
        { due_at: opportunity.nextActionAt },
        owner,
      ),
    );
  }

  activities.push(
    createActivity(
      base + 6,
      opportunity.id,
      "note",
      opportunity.lastActivityAt ?? minutesAgo(15),
      opportunity.type === "buyer"
        ? "Preferencias e limites de compra registados para proximo contacto."
        : "Contexto do imovel e expectativa do proprietario registados.",
      {},
      owner,
    ),
  );

  if (opportunity.status === "lost") {
    activities.push(
      createActivity(
        base + 7,
        opportunity.id,
        "lost",
        opportunity.lastActivityAt ?? daysAgo(1),
        opportunity.lostNotes,
        { reason: opportunity.lostReason },
        owner,
      ),
    );
  }

  return activities.sort(
    (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime(),
  );
});
