import { AlertTriangle, Circle, Flame, ThermometerSun } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { LeadTemperature, OpportunityStatus, OpportunityType } from "@/types/crm";

export function TypeBadge({ type }: { type: OpportunityType }) {
  return (
    <span className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700">
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
        temperature === "quente" && "bg-red-50 text-red-700",
        temperature === "morna" && "bg-amber-50 text-amber-800",
        temperature === "fria" && "bg-sky-50 text-sky-700",
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
        status === "new" && "bg-blue-50 text-blue-700",
        status === "open" && "bg-emerald-50 text-emerald-700",
        status === "won" && "bg-primary/10 text-primary",
        status === "lost" && "bg-red-50 text-red-700",
        status === "archived" && "bg-stone-100 text-stone-600",
      )}
    >
      {status === "new" ? "Nova" : status === "open" ? "Aberta" : status === "won" ? "Ganha" : status === "lost" ? "Perdida" : "Arquivada"}
    </span>
  );
}

export function AttentionBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-800">
      <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
      {children}
    </span>
  );
}
