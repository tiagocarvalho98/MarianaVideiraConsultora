import { PhoneCall } from "lucide-react";
import Link from "next/link";
import { completeTaskAction, registerCallAction } from "@/app/crm/actions";
import { OpportunityCard } from "@/components/crm/OpportunityCard";
import { PageIntro } from "@/components/crm/PageIntro";
import { getCrmRepository } from "@/lib/crm";

const hierarchy: Record<string, string> = {
  newUncontacted: "border-red-200 bg-red-50/50",
  overdue: "border-red-200 bg-red-50/50",
  todayActions: "border-primary/20 bg-primary/5",
  todayMeetings: "border-primary/20 bg-primary/5",
  missingNextAction: "border-orange-200 bg-orange-50/50",
  unassigned: "border-orange-200 bg-orange-50/50",
  stale: "border-stone-200 bg-white",
};

export default async function HojePage() {
  const repository = getCrmRepository();
  const groups = await repository.getTodayQueue();
  const total = groups.reduce((sum, group) => sum + group.opportunities.length, 0);
  const urgentCount =
    (groups.find((group) => group.id === "newUncontacted")?.opportunities.length ?? 0) +
    (groups.find((group) => group.id === "overdue")?.opportunities.length ?? 0);
  const todayCount =
    (groups.find((group) => group.id === "todayActions")?.opportunities.length ?? 0) +
    (groups.find((group) => group.id === "todayMeetings")?.opportunities.length ?? 0);

  return (
    <div>
      <PageIntro
        eyebrow="Homepage operacional"
        title="Hoje"
        description="Prioridades comerciais por ordem de urgencia: novas leads, follow-ups, reunioes e oportunidades que precisam de dono ou proxima acao."
      />

      <div className="mb-6 grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl bg-primary p-5 text-white md:col-span-2">
          <p className="text-sm font-semibold text-white/75">Prioridades abertas</p>
          <p className="mt-2 font-display text-5xl font-semibold">{total}</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <p className="text-sm font-semibold text-stone-600">Urgente</p>
          <p className="mt-2 text-3xl font-bold text-red-700">{urgentCount}</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <p className="text-sm font-semibold text-stone-600">Hoje</p>
          <p className="mt-2 text-3xl font-bold text-primary">{todayCount}</p>
        </div>
      </div>

      <div className="space-y-5">
        {groups.map((group) => (
          <section
            key={group.id}
            className={`rounded-2xl border p-5 shadow-sm ${hierarchy[group.id]}`}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-stone-950">{group.title}</h2>
                <p className="mt-1 text-sm text-stone-600">{group.description}</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-stone-700">
                {group.opportunities.length}
              </span>
            </div>

            {group.opportunities.length > 0 ? (
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {group.opportunities.map((opportunity) => (
                  <div
                    key={`${group.id}-${opportunity.id}`}
                    className="rounded-2xl bg-white/70 p-2"
                  >
                    <OpportunityCard opportunity={opportunity} compact showSource />
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Link
                        href={`/crm/oportunidades/${opportunity.id}`}
                        className="inline-flex min-h-10 items-center rounded-xl bg-primary px-3 text-sm font-bold text-white transition hover:bg-stone-900"
                      >
                        Abrir oportunidade
                      </Link>
                      <form action={registerCallAction}>
                        <input type="hidden" name="opportunityId" value={opportunity.id} />
                        <button className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-white px-3 text-sm font-bold text-stone-700 transition hover:border-primary hover:text-primary">
                          <PhoneCall className="h-4 w-4" aria-hidden="true" />
                          Registar chamada
                        </button>
                      </form>
                      {opportunity.nextTask ? (
                        <form action={completeTaskAction}>
                          <input type="hidden" name="taskId" value={opportunity.nextTask.id} />
                          <button className="inline-flex min-h-10 items-center rounded-xl border border-border bg-white px-3 text-sm font-bold text-stone-700 transition hover:border-primary hover:text-primary">
                            Concluir tarefa
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-border bg-white p-5 text-sm text-stone-600">
                Nada pendente neste bloco.
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
