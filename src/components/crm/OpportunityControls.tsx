"use client";

import { Check, PhoneCall, UserRound } from "lucide-react";
import {
  assignOpportunityAction,
  completeTaskAction,
  registerCallAction,
  setOpportunityTemperatureAction,
  updateOpportunityStageAction,
} from "@/app/crm/actions";
import { buyerPipelineStages, sellerPipelineStages } from "@/data/pipeline-stages";
import { leadTemperatures } from "@/data/temperatures";
import type { OpportunityWithRelations, Profile } from "@/types/crm";

type OpportunityControlsProps = {
  opportunity: OpportunityWithRelations;
  profiles: Profile[];
  compact?: boolean;
};

export function OpportunityControls({
  opportunity,
  profiles,
  compact = false,
}: OpportunityControlsProps) {
  const pipelineStages = opportunity.type === "buyer" ? buyerPipelineStages : sellerPipelineStages;
  const stages = pipelineStages.filter(
    (stage) => stage.id !== "perdido" || opportunity.stage === "perdido",
  );

  return (
    <div className={compact ? "grid gap-2" : "grid gap-3 md:grid-cols-3"}>
      <form action={updateOpportunityStageAction}>
        <input type="hidden" name="opportunityId" value={opportunity.id} />
        <label className="text-xs font-bold uppercase tracking-[0.14em] text-stone-400" htmlFor={`stage-${opportunity.id}`}>
          Estado
        </label>
        <select
          id={`stage-${opportunity.id}`}
          name="stage"
          defaultValue={opportunity.stage}
          className="mt-1 min-h-11 w-full rounded-xl border border-accent/20 bg-[#061a2b] px-3 text-sm font-semibold text-stone-100"
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
        >
          {stages.map((stage) => (
            <option key={stage.id} value={stage.id}>
              {stage.label}
            </option>
          ))}
        </select>
      </form>

      <form action={setOpportunityTemperatureAction}>
        <input type="hidden" name="opportunityId" value={opportunity.id} />
        <label className="text-xs font-bold uppercase tracking-[0.14em] text-stone-400" htmlFor={`temperature-${opportunity.id}`}>
          Temperatura
        </label>
        <select
          id={`temperature-${opportunity.id}`}
          name="temperature"
          defaultValue={opportunity.temperature}
          className="mt-1 min-h-11 w-full rounded-xl border border-accent/20 bg-[#061a2b] px-3 text-sm font-semibold text-stone-100"
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
        >
          {leadTemperatures.map((temperature) => (
            <option key={temperature.id} value={temperature.id}>
              {temperature.label}
            </option>
          ))}
        </select>
      </form>

      <form action={assignOpportunityAction}>
        <input type="hidden" name="opportunityId" value={opportunity.id} />
        <label className="text-xs font-bold uppercase tracking-[0.14em] text-stone-400" htmlFor={`assigned-${opportunity.id}`}>
          Responsavel
        </label>
        <select
          id={`assigned-${opportunity.id}`}
          name="assignedTo"
          defaultValue={opportunity.assignedTo ?? ""}
          className="mt-1 min-h-11 w-full rounded-xl border border-accent/20 bg-[#061a2b] px-3 text-sm font-semibold text-stone-100"
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
        >
          <option value="">Sem responsavel</option>
          {profiles.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.fullName}
            </option>
          ))}
        </select>
      </form>

      {compact ? (
        <div className="flex gap-2">
          <form action={registerCallAction} className="flex-1">
            <input type="hidden" name="opportunityId" value={opportunity.id} />
            <button className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-accent/25 bg-white/5 px-3 text-sm font-bold text-stone-100 transition hover:border-accent hover:text-accent">
              <PhoneCall className="h-4 w-4" aria-hidden="true" />
              Chamada
            </button>
          </form>
          {opportunity.nextTask ? (
            <form action={completeTaskAction} className="flex-1">
              <input type="hidden" name="taskId" value={opportunity.nextTask.id} />
              <button className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-accent/25 bg-white/5 px-3 text-sm font-bold text-stone-100 transition hover:border-accent hover:text-accent">
                <Check className="h-4 w-4" aria-hidden="true" />
                Concluir
              </button>
            </form>
          ) : null}
        </div>
      ) : (
        <div className="hidden items-center gap-2 text-sm text-stone-400 md:flex">
          <UserRound className="h-4 w-4" aria-hidden="true" />
          Alteracoes guardadas no CRM.
        </div>
      )}
    </div>
  );
}
