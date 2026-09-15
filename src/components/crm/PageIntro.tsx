type PageIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return (
    <div className="mb-6">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
        {eyebrow}
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-stone-950 md:text-5xl">
        {title}
      </h1>
      <p className="mt-3 max-w-3xl text-stone-600">{description}</p>
    </div>
  );
}
