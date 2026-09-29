"use client";

import { useState } from "react";
import { AlertTriangle, CalendarClock, X } from "lucide-react";
import { couldNotCompleteTaskAction } from "@/app/crm/actions";
import type { Task } from "@/types/crm";

export function TaskCouldNotCompleteDialog({
  task,
  opportunityId,
}: {
  task: Task;
  opportunityId: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#7a1b22]/45 px-4 text-sm font-bold text-red-100 transition hover:border-[#c54650] hover:text-white"
      >
        <AlertTriangle className="h-4 w-4" aria-hidden="true" />
        Nao foi possivel concluir
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-accent/25 bg-[#071d2e] p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">
                  Acao nao concluida
                </p>
                <h2 className="mt-2 text-2xl font-bold text-stone-50">
                  Registar motivo e reagendar
                </h2>
                <p className="mt-2 text-sm leading-6 text-stone-400">
                  A tarefa continua aberta. Se indicares nova data, a mesma acao fica reagendada.
                </p>
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

            <form action={couldNotCompleteTaskAction} className="mt-5 grid gap-4">
              <input type="hidden" name="taskId" value={task.id} />
              <input type="hidden" name="opportunityId" value={opportunityId} />
              <input type="hidden" name="title" value={task.title} />
              <input type="hidden" name="assignedTo" value={task.assignedTo ?? ""} />
              <input type="hidden" name="priority" value={task.priority} />

              <label className="grid gap-1 text-sm font-semibold text-stone-300">
                Motivo
                <select
                  required
                  name="reason"
                  className="min-h-11 rounded-xl border border-accent/20 bg-[#061a2b] px-3 text-sm text-stone-100"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Selecionar motivo
                  </option>
                  <option value="Cliente indisponivel">Cliente indisponivel</option>
                  <option value="Nao atendeu / sem resposta">Nao atendeu / sem resposta</option>
                  <option value="Visita cancelada pelo cliente">Visita cancelada pelo cliente</option>
                  <option value="Imovel indisponivel">Imovel indisponivel</option>
                  <option value="Conflito de agenda">Conflito de agenda</option>
                  <option value="Outro">Outro</option>
                </select>
              </label>

              <label className="grid gap-1 text-sm font-semibold text-stone-300">
                Nova data opcional
                <input
                  type="datetime-local"
                  name="nextDueAt"
                  className="min-h-11 rounded-xl border border-accent/20 bg-[#061a2b] px-3 text-sm text-stone-100"
                />
              </label>

              <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-bold text-primary-foreground transition hover:bg-primary">
                <CalendarClock className="h-4 w-4" aria-hidden="true" />
                Guardar motivo
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
