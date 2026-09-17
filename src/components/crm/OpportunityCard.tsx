import Link from "next/link";
import { AlertCircle, CalendarClock, MapPin, UserRound } from "lucide-react";
import { AttentionBadge, TemperatureBadge, TypeBadge } from "./Badges";
import {
  formatContactName,
  formatDateTime,
  formatRelativeTime,
  formatStage,
} from "@/lib/crm/format";
import { cn } from "@/lib/utils";
import type { OpportunityWithRelations } from "@/types/crm";

type OpportunityCardProps = {
  opportunity: OpportunityWithRelations;
  compact?: boolean;
  showSource?: boolean;
};

export function OpportunityCard({
  opportunity,
  compact = false,
  showSource = false,
}: OpportunityCardProps) {
  const name = formatContactName(
    opportunity.contact.firstName,
    opportunity.contact.lastName,
  );
  const isOverdue = Boolean(
    opportunity.nextActionAt &&
      new Date(opportunity.nextActionAt).getTime() < Date.now(),
  );
  const requiresAttention =
    !opportunity.assignedTo || !opportunity.nextActionAt || isOverdue;

  return (
    <article
      className={cn(
        "crm-card rounded-2xl p-4 transition hover:border-accent/40",
        requiresAttention && "border-[#7a1b22]/60",
        compact && "p-3",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/crm/oportunidades/${opportunity.id}`}
              className="text-base font-bold text-stone-50 hover:text-accent"
            >
              {name}
            </Link>
            <TypeBadge type={opportunity.type} />
          </div>
          <p className="mt-1 text-sm font-semibold text-stone-300">
            {formatStage(opportunity.stage)}
          </p>
        </div>
        <TemperatureBadge temperature={opportunity.temperature} />
      </div>

      <div className="mt-4 grid gap-2 text-sm text-stone-300">
        <span className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-accent/70" aria-hidden="true" />
          {opportunity.location ?? "Localizacao por confirmar"}
        </span>
        <span className="flex items-center gap-2">
          <UserRound className="h-4 w-4 text-accent/70" aria-hidden="true" />
          {opportunity.assignedProfile?.fullName ?? "Sem responsavel"}
        </span>
        <span className="flex items-start gap-2">
          <CalendarClock className="mt-0.5 h-4 w-4 text-accent/70" aria-hidden="true" />
          <span>
            {opportunity.nextTask?.title ?? "Sem proxima acao"} ·{" "}
            {formatDateTime(opportunity.nextActionAt)}
            {opportunity.nextActionAt ? (
              <span className="ml-1 font-semibold text-stone-100">
                {formatRelativeTime(opportunity.nextActionAt)}
              </span>
            ) : null}
          </span>
        </span>
        {showSource && opportunity.source ? (
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-stone-400">
            Origem: {opportunity.source.name}
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {requiresAttention ? (
          <AttentionBadge>
            <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
            {isOverdue ? "Vencida" : "Atencao"}
          </AttentionBadge>
        ) : null}
        <Link
          href={`/crm/oportunidades/${opportunity.id}`}
          className="inline-flex min-h-10 items-center rounded-xl border border-accent/25 px-3 text-sm font-bold text-stone-100 transition hover:border-accent hover:text-accent"
        >
          Abrir
        </Link>
      </div>
    </article>
  );
}
