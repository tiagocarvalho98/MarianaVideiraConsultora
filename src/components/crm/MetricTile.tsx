type MetricTileProps = {
  label: string;
  value: string | number;
  hint?: string;
};

export function MetricTile({ label, value, hint }: MetricTileProps) {
  return (
    <article className="crm-card crm-geometric-detail rounded-2xl p-4">
      <p className="text-sm font-semibold text-stone-300">{label}</p>
      <p className="mt-3 font-display text-4xl font-semibold text-stone-50">{value}</p>
      {hint ? <p className="mt-2 text-sm leading-6 text-stone-400">{hint}</p> : null}
    </article>
  );
}
