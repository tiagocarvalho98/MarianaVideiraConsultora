import { AlertTriangle, Circle, Flame, ThermometerSun } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { LeadTemperature, OpportunityStatus, OpportunityType } from "@/types/crm";

export function TypeBadge({ type }: { type: OpportunityType }) {
  return (
    <span className="inline-flex items-center rounded-full border border-accent/25 bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
      {type === "buyer" ? "Comprador" : "Vendedor"}
    </span>
  );
}

export function TemperatureBadge({ temperature }: { temperature: LeadTemperature }) {
  const Icon = temperature === "quente" ? Flame : temperature === "morna" ? ThermometerSun : Circle;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
        temperature === "quente" && "border border-[#7a1b22]/55 bg-[#7a1b22]/20 text-red-100",
        temperature === "morna" && "border border-amber-300/30 bg-amber-300/10 text-amber-100",
        temperature === "fria" && "border border-sky-300/30 bg-sky-300/10 text-sky-100",
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {temperature}
    </span>
  );
}

export function StatusBadge({ status }: { status: OpportunityStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold",
        status === "new" && "border border-sky-300/30 bg-sky-300/10 text-sky-100",
        status === "open" && "border border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
        status === "won" && "border border-primary/35 bg-primary/10 text-accent",
        status === "lost" && "border border-[#7a1b22]/55 bg-[#7a1b22]/20 text-red-100",
        status === "archived" && "border border-stone-400/25 bg-stone-400/10 text-stone-300",
      )}
    >
      {status === "new" ? "Nova" : status === "open" ? "Aberta" : status === "won" ? "Ganha" : status === "lost" ? "Perdida" : "Arquivada"}
    </span>
  );
}

export function AttentionBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#7a1b22]/60 bg-[#7a1b22]/25 px-2.5 py-1 text-xs font-bold text-red-100">
      <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
      {children}
    </span>
  );
}
