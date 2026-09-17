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
    <section className="crm-surface rounded-3xl p-5">
      <h2 className="relative text-lg font-bold text-stone-50">Registar atividade</h2>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <form action={registerCallAction} className="relative rounded-xl border border-white/10 bg-white/[0.035] p-3">
          <input type="hidden" name="opportunityId" value={opportunity.id} />
          <label className="grid gap-2 text-sm font-semibold text-stone-300">
            Chamada
            <textarea
              name="body"
              rows={3}
              placeholder="Resumo breve da chamada"
              className="rounded-xl border border-accent/20 bg-[#061a2b] px-3 py-2 text-sm text-stone-100"
            />
          </label>
          <button className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-accent/25 bg-white/5 px-4 text-sm font-bold text-stone-100 transition hover:border-accent hover:text-accent">
            <PhoneCall className="h-4 w-4" aria-hidden="true" />
            Registar chamada
          </button>
        </form>

        <form action={registerMeetingAction} className="relative rounded-xl border border-white/10 bg-white/[0.035] p-3">
          <input type="hidden" name="opportunityId" value={opportunity.id} />
          <label className="grid gap-2 text-sm font-semibold text-stone-300">
            Reuniao
            <textarea
              name="body"
              rows={3}
              placeholder="Resumo e proximos passos"
              className="rounded-xl border border-accent/20 bg-[#061a2b] px-3 py-2 text-sm text-stone-100"
            />
          </label>
          <button className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-accent/25 bg-white/5 px-4 text-sm font-bold text-stone-100 transition hover:border-accent hover:text-accent">
            <CalendarClock className="h-4 w-4" aria-hidden="true" />
            Registar reuniao
          </button>
        </form>

        <form action={addNoteAction} className="relative rounded-xl border border-white/10 bg-white/[0.035] p-3">
          <input type="hidden" name="opportunityId" value={opportunity.id} />
          <label className="grid gap-2 text-sm font-semibold text-stone-300">
            Nota
            <textarea
              required
              name="body"
              rows={3}
              placeholder="Nota interna"
              className="rounded-xl border border-accent/20 bg-[#061a2b] px-3 py-2 text-sm text-stone-100"
            />
          </label>
          <button className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-accent/25 bg-white/5 px-4 text-sm font-bold text-stone-100 transition hover:border-accent hover:text-accent">
            <StickyNote className="h-4 w-4" aria-hidden="true" />
            Adicionar nota
          </button>
        </form>
      </div>
    </section>
  );
}
