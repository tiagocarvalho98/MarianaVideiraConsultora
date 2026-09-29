import { crmSectionAccents } from "@/data/crm-visual-system";
import { cn } from "@/lib/utils";

type MetricTileProps = {
  label: string;
  value: string | number;
  hint?: string;
  accent?: keyof typeof crmSectionAccents;
};

export function MetricTile({ label, value, hint, accent = "operation" }: MetricTileProps) {
  const colors = crmSectionAccents[accent];

  return (
    <article className={cn("crm-card crm-geometric-detail rounded-2xl p-4", colors.panel)}>
      <div className={cn("mb-3 h-1 w-12 rounded-full", colors.bar)} />
      <p className="text-sm font-semibold text-stone-300">{label}</p>
      <p className={cn("mt-3 font-display text-4xl font-semibold", colors.text)}>{value}</p>
      {hint ? <p className="mt-2 text-sm leading-6 text-stone-400">{hint}</p> : null}
    </article>
  );
}
