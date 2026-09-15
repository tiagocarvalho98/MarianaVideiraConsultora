"use client";

import { useState } from "react";
import { XCircle } from "lucide-react";
import { markOpportunityLostAction } from "@/app/crm/actions";
import { buyerLostReasons, sellerLostReasons } from "@/data/lost-reasons";
import type { OpportunityWithRelations } from "@/types/crm";

export function LostOpportunityDialog({
  opportunity,
}: {
  opportunity: OpportunityWithRelations;
}) {
  const [open, setOpen] = useState(false);
  const reasons = opportunity.type === "buyer" ? buyerLostReasons : sellerLostReasons;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-bold text-red-700 transition hover:bg-red-100"
      >
        <XCircle className="h-4 w-4" aria-hidden="true" />
        Marcar perdido
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-stone-950/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`lost-title-${opportunity.id}`}
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id={`lost-title-${opportunity.id}`} className="text-xl font-bold text-stone-950">
                  Marcar como perdido
                </h2>
                <p className="mt-1 text-sm text-stone-600">
                  Escolhe um motivo estruturado. A observacao e opcional.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="min-h-11 rounded-xl px-3 text-sm font-bold text-stone-600 transition hover:bg-stone-100"
              >
                Fechar
              </button>
            </div>
            <form action={markOpportunityLostAction} className="mt-5 grid gap-4">
              <input type="hidden" name="opportunityId" value={opportunity.id} />
              <label className="grid gap-1 text-sm font-semibold text-stone-700">
                Motivo
                <select
                  required
                  name="reason"
                  className="min-h-11 rounded-xl border border-border bg-white px-3 text-sm text-stone-900"
                >
                  {reasons.map((reason) => (
                    <option key={reason.id} value={reason.id}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm font-semibold text-stone-700">
                Observacao
                <textarea
                  name="notes"
                  rows={4}
                  className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-stone-900"
                />
              </label>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-4 text-sm font-bold text-stone-700 transition hover:bg-stone-100"
                >
                  Cancelar
                </button>
                <button className="inline-flex min-h-11 items-center justify-center rounded-xl bg-red-700 px-4 text-sm font-bold text-white transition hover:bg-red-800">
                  Confirmar perdido
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
