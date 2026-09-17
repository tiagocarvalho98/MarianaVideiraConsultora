"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Building2,
  CalendarClock,
  Check,
  ExternalLink,
  MapPin,
  PhoneCall,
  X,
} from "lucide-react";
import {
  completeTaskAction,
  createTaskAction,
  registerCallAction,
} from "@/app/crm/actions";
import { taskPriorities } from "@/data/task-priorities";
import { formatContactName, formatDateTime, formatRelativeTime } from "@/lib/crm/format";
import { cn } from "@/lib/utils";
import { OpportunityControls } from "./OpportunityControls";
import { TemperatureBadge, TypeBadge } from "./Badges";
import type { OpportunityWithRelations, Profile } from "@/types/crm";

type PipelineOpportunityDialogProps = {
  opportunity: OpportunityWithRelations;
  profiles: Profile[];
};

function toLocalDateTimeValue(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

export function PipelineOpportunityDialog({
  opportunity,
  profiles,
}: PipelineOpportunityDialogProps) {
  const [open, setOpen] = useState(false);
  const name = formatContactName(
    opportunity.contact.firstName,
    opportunity.contact.lastName,
  );
  const propertySummary = [opportunity.propertyType, opportunity.typology]
    .filter(Boolean)
    .join(" · ");
  const nextTask = opportunity.nextTask;
  const isOverdue = Boolean(nextTask && new Date(nextTask.dueAt).getTime() < Date.now());

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "w-full rounded-xl border border-white/10 bg-[#102a3d] p-3 text-left transition hover:border-accent/60 hover:bg-[#14334a]",
          (!opportunity.assignedTo || !opportunity.nextActionAt || isOverdue) &&
            "border-[#7a1b22]/60",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-stone-50">{name}</p>
            <p className="mt-0.5 truncate text-xs font-semibold text-stone-300">
              {opportunity.location ?? "Localizacao por confirmar"}
            </p>
          </div>
          <TemperatureBadge temperature={opportunity.temperature} />
        </div>

        <div className="mt-2 grid gap-1 text-xs text-stone-300">
          {propertySummary ? (
            <span className="flex min-w-0 items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 shrink-0 text-accent/70" aria-hidden="true" />
              <span className="truncate">{propertySummary}</span>
            </span>
          ) : null}
          <span className="flex min-w-0 items-center gap-1.5">
            <CalendarClock className="h-3.5 w-3.5 shrink-0 text-accent/70" aria-hidden="true" />
            <span className="truncate">
              {nextTask?.title ?? "Sem proxima acao"}
              {opportunity.nextActionAt ? ` · ${formatDateTime(opportunity.nextActionAt)}` : ""}
            </span>
          </span>
        </div>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-3xl border border-accent/25 bg-[#071d2e] p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <TypeBadge type={opportunity.type} />
                  <TemperatureBadge temperature={opportunity.temperature} />
                </div>
                <h2 className="mt-3 text-2xl font-bold text-stone-50">{name}</h2>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-stone-300">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-accent/70" aria-hidden="true" />
                    {opportunity.location ?? "Localizacao por confirmar"}
                  </span>
                  {propertySummary ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 className="h-4 w-4 text-accent/70" aria-hidden="true" />
                      {propertySummary}
                    </span>
                  ) : null}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 text-stone-200 transition hover:border-accent hover:text-accent"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-accent">
                Editar oportunidade
              </h3>
              <div className="mt-4">
                <OpportunityControls opportunity={opportunity} profiles={profiles} />
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-accent">
                    Proxima acao
                  </h3>
                  <p className="mt-2 text-lg font-bold text-stone-50">
                    {nextTask?.title ?? "Sem acao definida"}
                  </p>
                  <p className="mt-1 text-sm text-stone-400">
                    {nextTask
                      ? `${formatDateTime(nextTask.dueAt)} · ${formatRelativeTime(nextTask.dueAt)}`
                      : "Cria uma tarefa para manter esta oportunidade em movimento."}
                  </p>
                </div>
                <div className="flex gap-2">
                  <form action={registerCallAction}>
                    <input type="hidden" name="opportunityId" value={opportunity.id} />
                    <button className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-accent/25 px-3 text-sm font-bold text-stone-100 transition hover:border-accent hover:text-accent">
                      <PhoneCall className="h-4 w-4" aria-hidden="true" />
                      Chamada
                    </button>
                  </form>
                  {nextTask ? (
                    <form action={completeTaskAction}>
                      <input type="hidden" name="taskId" value={nextTask.id} />
                      <button className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-accent/25 px-3 text-sm font-bold text-stone-100 transition hover:border-accent hover:text-accent">
                        <Check className="h-4 w-4" aria-hidden="true" />
                        Concluir
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>

              <form action={createTaskAction} className="mt-4 grid gap-3 md:grid-cols-2">
                <input type="hidden" name="opportunityId" value={opportunity.id} />
                <label className="grid gap-1 text-sm font-semibold text-stone-300 md:col-span-2">
                  Titulo
                  <input
                    required
                    name="title"
                    defaultValue={nextTask?.title ?? ""}
                    className="min-h-11 rounded-xl border border-accent/20 bg-[#061a2b] px-3 text-sm text-stone-100"
                  />
                </label>
                <label className="grid gap-1 text-sm font-semibold text-stone-300">
                  Data
                  <input
                    required
                    type="datetime-local"
                    name="dueAt"
                    defaultValue={toLocalDateTimeValue(nextTask?.dueAt ?? null)}
                    className="min-h-11 rounded-xl border border-accent/20 bg-[#061a2b] px-3 text-sm text-stone-100"
                  />
                </label>
                <label className="grid gap-1 text-sm font-semibold text-stone-300">
                  Responsavel
                  <select
                    name="assignedTo"
                    defaultValue={nextTask?.assignedTo ?? opportunity.assignedTo ?? ""}
                    className="min-h-11 rounded-xl border border-accent/20 bg-[#061a2b] px-3 text-sm text-stone-100"
                  >
                    <option value="">Sem responsavel</option>
                    {profiles.map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        {profile.fullName}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1 text-sm font-semibold text-stone-300">
                  Prioridade
                  <select
                    name="priority"
                    defaultValue={nextTask?.priority ?? "normal"}
                    className="min-h-11 rounded-xl border border-accent/20 bg-[#061a2b] px-3 text-sm text-stone-100"
                  >
                    {taskPriorities.map((priority) => (
                      <option key={priority.id} value={priority.id}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex items-end gap-2">
                  <button className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-accent px-4 text-sm font-bold text-primary-foreground transition hover:bg-primary">
                    Guardar tarefa
                  </button>
                  <Link
                    href={`/crm/oportunidades/${opportunity.id}`}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-accent/25 px-4 text-sm font-bold text-stone-100 transition hover:border-accent hover:text-accent"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    Ficha
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
