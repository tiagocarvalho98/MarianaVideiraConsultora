import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { completeTaskAction, createTaskAction } from "@/app/crm/actions";
import { taskPriorities } from "@/data/task-priorities";
import { formatDateTime, formatRelativeTime } from "@/lib/crm/format";
import { cn } from "@/lib/utils";
import type { OpportunityWithRelations, Profile } from "@/types/crm";

function toLocalDateTimeValue(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

export function NextActionPanel({
  opportunity,
  profiles,
}: {
  opportunity: OpportunityWithRelations;
  profiles: Profile[];
}) {
  const nextTask = opportunity.nextTask;
  const isOverdue = Boolean(nextTask && new Date(nextTask.dueAt).getTime() < Date.now());
  const qualifiedWithoutAction = opportunity.stage === "qualificado" && !nextTask;

  return (
    <section
      className={cn(
        "rounded-2xl border bg-white p-5 shadow-sm",
        isOverdue || qualifiedWithoutAction ? "border-orange-300" : "border-border",
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-accent">Proxima acao</p>
          <h2 className="mt-1 text-xl font-bold text-stone-950">
            {nextTask?.title ?? "Sem acao definida"}
          </h2>
          {nextTask ? (
            <p className="mt-1 text-sm text-stone-600">
              {formatDateTime(nextTask.dueAt)} · {formatRelativeTime(nextTask.dueAt)}
            </p>
          ) : (
            <p className="mt-1 text-sm text-stone-600">
              Define uma tarefa para manter esta oportunidade em movimento.
            </p>
          )}
        </div>
        {isOverdue || qualifiedWithoutAction ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-sm font-bold text-orange-800">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            Requer atencao
          </span>
        ) : null}
      </div>

      {nextTask ? (
        <div className="mt-4 rounded-xl bg-stone-50 p-4">
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="font-bold text-stone-500">Responsavel</dt>
              <dd className="mt-1 text-stone-900">
                {profiles.find((profile) => profile.id === nextTask.assignedTo)?.fullName ??
                  "Sem responsavel"}
              </dd>
            </div>
            <div>
              <dt className="font-bold text-stone-500">Prioridade</dt>
              <dd className="mt-1 text-stone-900">{nextTask.priority}</dd>
            </div>
            <div>
              <dt className="font-bold text-stone-500">Estado</dt>
              <dd className="mt-1 text-stone-900">
                {isOverdue ? "Vencida" : "Planeada"}
              </dd>
            </div>
          </dl>
          <form action={completeTaskAction} className="mt-4">
            <input type="hidden" name="taskId" value={nextTask.id} />
            <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white transition hover:bg-stone-900">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Marcar concluida
            </button>
          </form>
        </div>
      ) : null}

      <form action={createTaskAction} className="mt-5 grid gap-3 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.7fr_auto]">
        <input type="hidden" name="opportunityId" value={opportunity.id} />
        <label className="grid gap-1 text-sm font-semibold text-stone-700">
          Titulo
          <input
            required
            name="title"
            defaultValue={nextTask?.title ?? ""}
            className="min-h-11 rounded-xl border border-border bg-white px-3 text-sm text-stone-900"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-stone-700">
          Data
          <input
            required
            type="datetime-local"
            name="dueAt"
            defaultValue={toLocalDateTimeValue(nextTask?.dueAt ?? null)}
            className="min-h-11 rounded-xl border border-border bg-white px-3 text-sm text-stone-900"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-stone-700">
          Responsavel
          <select
            name="assignedTo"
            defaultValue={nextTask?.assignedTo ?? opportunity.assignedTo ?? ""}
            className="min-h-11 rounded-xl border border-border bg-white px-3 text-sm text-stone-900"
          >
            <option value="">Sem responsavel</option>
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.fullName}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold text-stone-700">
          Prioridade
          <select
            name="priority"
            defaultValue={nextTask?.priority ?? "normal"}
            className="min-h-11 rounded-xl border border-border bg-white px-3 text-sm text-stone-900"
          >
            {taskPriorities.map((priority) => (
              <option key={priority.id} value={priority.id}>
                {priority.label}
              </option>
            ))}
          </select>
        </label>
        <button className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-bold text-stone-800 transition hover:border-primary hover:text-primary md:mt-auto">
          <Clock className="h-4 w-4" aria-hidden="true" />
          Guardar
        </button>
      </form>
    </section>
  );
}
