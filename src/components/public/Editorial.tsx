import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { brand } from "@/config/brand";

export function Hero({
  eyebrow,
  title,
  body,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  eyebrow: string;
  title: string;
  body: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <section className="border-b border-stone-200">
      <div className="mx-auto grid min-h-[calc(100dvh-8rem)] max-w-7xl gap-10 px-5 py-12 md:grid-cols-[1.05fr_0.95fr] md:items-center lg:px-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent">
            {eyebrow}
          </p>
          <h1 className="mt-5 max-w-4xl font-display text-5xl font-semibold leading-[1.02] text-stone-950 md:text-7xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-700">{body}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={primaryHref}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold uppercase text-white transition hover:bg-stone-900"
            >
              {primaryLabel}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            {secondaryHref && secondaryLabel ? (
              <Link
                href={secondaryHref}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-border bg-white px-5 text-sm font-bold uppercase text-stone-800 transition hover:border-primary hover:text-primary"
              >
                {secondaryLabel}
              </Link>
            ) : null}
          </div>
        </div>
        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-stone-200 bg-stone-100">
            <Image
              src={brand.profileImage}
              alt="Espaco reservado para fotografia real de Mariana Videira"
              fill
              priority
              className="object-cover"
            />
          </div>
          <div className="mt-3 border-l-4 border-accent pl-4 text-sm leading-6 text-stone-600">
            Placeholder identificado. Substituir por fotografia real fornecida.
          </div>
        </div>
      </div>
    </section>
  );
}

export function SectionIntro({
  eyebrow,
  title,
  body,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-stone-950 md:text-5xl">
        {title}
      </h2>
      {body ? <p className="mt-5 text-lg leading-8 text-stone-700">{body}</p> : null}
    </div>
  );
}

export function EditorialBand({ children }: { children: React.ReactNode }) {
  return <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">{children}</section>;
}

export function NumberedProcess({ items }: { items: readonly string[] }) {
  return (
    <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => (
        <li key={item} className="border-t border-stone-300 pt-4">
          <span className="font-mono text-xs text-accent">{String(index + 1).padStart(2, "0")}</span>
          <p className="mt-3 text-lg font-bold leading-7 text-stone-950">{item}</p>
        </li>
      ))}
    </ol>
  );
}

export function TextColumns({
  items,
}: {
  items: ReadonlyArray<{ title: string; body: string }>;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {items.map((item) => (
        <article key={item.title} className="border-t border-stone-300 pt-4">
          <h3 className="text-xl font-bold text-stone-950">{item.title}</h3>
          <p className="mt-3 leading-7 text-stone-700">{item.body}</p>
        </article>
      ))}
    </div>
  );
}

export function CtaBand({
  title,
  body,
  href,
  label,
}: {
  title: string;
  body: string;
  href: string;
  label: string;
}) {
  return (
    <section className="bg-primary text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-14 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <h2 className="font-display text-4xl font-semibold">{title}</h2>
          <p className="mt-3 max-w-2xl leading-7 text-white/80">{body}</p>
        </div>
        <Link
          href={href}
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-5 text-sm font-bold uppercase text-primary transition hover:bg-stone-100"
        >
          {label}
        </Link>
      </div>
    </section>
  );
}
