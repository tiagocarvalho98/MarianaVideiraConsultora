type CrmPagePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function CrmPagePlaceholder({
  eyebrow,
  title,
  description,
}: CrmPagePlaceholderProps) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-soft">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
        {eyebrow}
      </p>
      <h1 className="mt-4 font-display text-4xl font-semibold leading-tight">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-stone-600">{description}</p>
      <div className="mt-8 rounded-xl border border-dashed border-border bg-stone-50 p-6 text-sm text-stone-600">
        Superficie funcional criada na Fase 1. Conteudo operacional entra em
        fases seguintes.
      </div>
    </section>
  );
}
