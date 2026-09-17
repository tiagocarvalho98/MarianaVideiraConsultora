type PageIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return (
    <div className="crm-surface crm-geometric-detail mb-6 rounded-3xl px-5 py-6 md:px-7">
      <div className="relative">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-stone-50 md:text-5xl">
          {title}
        </h1>
        <p className="mt-3 max-w-3xl leading-7 text-stone-300">{description}</p>
      </div>
    </div>
  );
}
