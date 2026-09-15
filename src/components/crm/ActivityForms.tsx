import { CalendarClock, PhoneCall, StickyNote } from "lucide-react";
import {
  addNoteAction,
  registerCallAction,
  registerMeetingAction,
} from "@/app/crm/actions";
import type { OpportunityWithRelations } from "@/types/crm";

export function ActivityForms({
  opportunity,
}: {
  opportunity: OpportunityWithRelations;
}) {
  return (
    <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-stone-950">Registar atividade</h2>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <form action={registerCallAction} className="rounded-xl bg-stone-50 p-3">
          <input type="hidden" name="opportunityId" value={opportunity.id} />
          <label className="grid gap-2 text-sm font-semibold text-stone-700">
            Chamada
            <textarea
              name="body"
              rows={3}
              placeholder="Resumo breve da chamada"
              className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-stone-900"
            />
          </label>
          <button className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-bold text-stone-800 transition hover:border-primary hover:text-primary">
            <PhoneCall className="h-4 w-4" aria-hidden="true" />
            Registar chamada
          </button>
        </form>

        <form action={registerMeetingAction} className="rounded-xl bg-stone-50 p-3">
          <input type="hidden" name="opportunityId" value={opportunity.id} />
          <label className="grid gap-2 text-sm font-semibold text-stone-700">
            Reuniao
            <textarea
              name="body"
              rows={3}
              placeholder="Resumo e proximos passos"
              className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-stone-900"
            />
          </label>
          <button className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-bold text-stone-800 transition hover:border-primary hover:text-primary">
            <CalendarClock className="h-4 w-4" aria-hidden="true" />
            Registar reuniao
          </button>
        </form>

        <form action={addNoteAction} className="rounded-xl bg-stone-50 p-3">
          <input type="hidden" name="opportunityId" value={opportunity.id} />
          <label className="grid gap-2 text-sm font-semibold text-stone-700">
            Nota
            <textarea
              required
              name="body"
              rows={3}
              placeholder="Nota interna"
              className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-stone-900"
            />
          </label>
          <button className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-bold text-stone-800 transition hover:border-primary hover:text-primary">
            <StickyNote className="h-4 w-4" aria-hidden="true" />
            Adicionar nota
          </button>
        </form>
      </div>
    </section>
  );
}
