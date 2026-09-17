import { PhoneCall } from "lucide-react";
import Link from "next/link";
import { completeTaskAction, registerCallAction } from "@/app/crm/actions";
import { OpportunityCard } from "@/components/crm/OpportunityCard";
import { PageIntro } from "@/components/crm/PageIntro";
import { getCrmRepository } from "@/lib/crm";

const hierarchy: Record<string, string> = {
  newUncontacted: "border-[#7a1b22]/55",
  overdue: "border-[#7a1b22]/55",
  todayActions: "border-accent/25",
  todayMeetings: "border-accent/25",
  missingNextAction: "border-amber-300/25",
  unassigned: "border-amber-300/25",
  stale: "border-white/10",
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
        <div className="crm-surface crm-geometric-detail rounded-3xl p-5 md:col-span-2">
          <p className="text-sm font-semibold text-stone-300">Prioridades abertas</p>
          <p className="mt-2 font-display text-5xl font-semibold">{total}</p>
        </div>
        <div className="crm-card rounded-3xl p-5">
          <p className="text-sm font-semibold text-stone-300">Urgente</p>
          <p className="mt-2 text-3xl font-bold text-red-100">{urgentCount}</p>
        </div>
        <div className="crm-card rounded-3xl p-5">
          <p className="text-sm font-semibold text-stone-300">Hoje</p>
          <p className="mt-2 text-3xl font-bold text-accent">{todayCount}</p>
        </div>
      </div>

      <div className="space-y-5">
        {groups.map((group) => (
          <section
            key={group.id}
            className={`crm-surface rounded-3xl border p-5 ${hierarchy[group.id]}`}
          >
            <div className="relative flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-stone-50">{group.title}</h2>
                <p className="mt-1 text-sm text-stone-400">{group.description}</p>
              </div>
              <span className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-sm font-bold text-accent">
                {group.opportunities.length}
              </span>
            </div>

            {group.opportunities.length > 0 ? (
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {group.opportunities.map((opportunity) => (
                  <div
                    key={`${group.id}-${opportunity.id}`}
                    className="rounded-2xl bg-white/[0.03] p-2"
                  >
                    <OpportunityCard opportunity={opportunity} compact showSource />
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Link
                        href={`/crm/oportunidades/${opportunity.id}`}
                        className="inline-flex min-h-10 items-center rounded-xl bg-accent px-3 text-sm font-bold text-primary-foreground transition hover:bg-primary"
                      >
                        Abrir oportunidade
                      </Link>
                      <form action={registerCallAction}>
                        <input type="hidden" name="opportunityId" value={opportunity.id} />
                          <button className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-accent/25 bg-white/5 px-3 text-sm font-bold text-stone-100 transition hover:border-accent hover:text-accent">
                          <PhoneCall className="h-4 w-4" aria-hidden="true" />
                          Registar chamada
                        </button>
                      </form>
                      {opportunity.nextTask ? (
                        <form action={completeTaskAction}>
                          <input type="hidden" name="taskId" value={opportunity.nextTask.id} />
                          <button className="inline-flex min-h-10 items-center rounded-xl border border-accent/25 bg-white/5 px-3 text-sm font-bold text-stone-100 transition hover:border-accent hover:text-accent">
                            Concluir tarefa
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative mt-4 rounded-xl border border-dashed border-accent/25 bg-white/5 p-5 text-sm text-stone-400">
                Nada pendente neste bloco.
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
