type MetricTileProps = {
  label: string;
  value: string | number;
  hint?: string;
};

export function MetricTile({ label, value, hint }: MetricTileProps) {
  return (
    <article className="rounded-2xl border border-border bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-stone-600">{label}</p>
      <p className="mt-3 font-display text-4xl font-semibold text-stone-950">
        {value}
      </p>
      {hint ? <p className="mt-2 text-sm text-stone-500">{hint}</p> : null}
    </article>
  );
}
