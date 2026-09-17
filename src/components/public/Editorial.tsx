import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero({
  eyebrow,
  title,
  body,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  image,
}: {
  eyebrow: string;
  title: string;
  body: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  image?: {
    src: string;
    alt: string;
    objectPosition?: string;
  };
}) {
  if (image) {
    return (
      <section className="overflow-hidden border-b border-primary/14 bg-background">
        <div className="grid lg:grid-cols-[0.4fr_0.6fr]">
          <div className="relative min-h-[45dvh] max-h-[34rem] overflow-hidden lg:order-2 lg:h-[clamp(37.5rem,68vh,42.5rem)] lg:max-h-none">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-cover"
              style={{ objectPosition: image.objectPosition ?? "center" }}
            />
          </div>

          <div className="flex min-h-[24rem] items-center px-5 py-14 lg:h-[clamp(37.5rem,68vh,42.5rem)] lg:px-10 xl:px-14">
            <div className="mx-auto w-full max-w-xl lg:mx-0">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.34em] text-primary">
                {eyebrow}
              </p>
              <h1 className="mt-5 max-w-[12ch] font-display text-[clamp(3.5rem,5vw,5.5rem)] font-medium leading-[0.94] text-foreground">
                {title}
              </h1>
              <p className="mt-6 max-w-md text-base leading-8 text-foreground/70 md:text-lg">{body}</p>
              <div className="mt-8">
                <Link
                  href={primaryHref}
                  className="inline-flex min-h-12 items-center justify-center gap-2 border border-primary bg-primary px-5 text-sm font-bold uppercase tracking-[0.18em] text-primary-foreground transition hover:bg-accent"
                >
                  {primaryLabel}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-primary/14 bg-background">
      <div className="mx-auto flex min-h-[68dvh] max-w-7xl items-center px-5 py-14 lg:px-8">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.34em] text-primary">
            {eyebrow}
          </p>
          <h1 className="mt-5 max-w-4xl font-display text-5xl font-medium leading-[0.96] text-foreground md:text-7xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-foreground/68">{body}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={primaryHref}
              className="inline-flex min-h-12 items-center justify-center gap-2 border border-primary bg-primary px-5 text-sm font-bold uppercase tracking-[0.18em] text-primary-foreground transition hover:bg-accent"
            >
              {primaryLabel}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            {secondaryHref && secondaryLabel ? (
              <Link
                href={secondaryHref}
                className="inline-flex min-h-12 items-center justify-center border border-primary/50 px-5 text-sm font-bold uppercase tracking-[0.18em] text-primary transition hover:bg-primary hover:text-primary-foreground"
              >
                {secondaryLabel}
              </Link>
            ) : null}
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
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.3em] text-primary">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-3 font-display text-4xl font-medium leading-tight text-foreground md:text-5xl">
        {title}
      </h2>
      {body ? <p className="mt-5 text-lg leading-8 text-foreground/68">{body}</p> : null}
    </div>
  );
}

export function EditorialBand({ children }: { children: React.ReactNode }) {
  return (
    <section className="luxury-section mx-auto max-w-7xl px-5 py-16 lg:px-8">
      {children}
    </section>
  );
}

export function NumberedProcess({ items }: { items: readonly string[] }) {
  return (
    <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => (
        <li key={item} className="border-t border-primary/24 pt-4">
          <span className="text-xs font-bold tracking-[0.22em] text-primary">
            {String(index + 1).padStart(2, "0")}
          </span>
          <p className="mt-3 text-lg font-semibold leading-7 text-foreground">{item}</p>
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
        <article key={item.title} className="border-t border-primary/24 pt-4">
          <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
          <p className="mt-3 leading-7 text-foreground/66">{item.body}</p>
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
    <section className="border-y border-primary/18 bg-[#020f1c] text-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-16 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <h2 className="font-display text-4xl font-medium">{title}</h2>
          <p className="mt-3 max-w-2xl leading-7 text-foreground/68">{body}</p>
        </div>
        <Link
          href={href}
          className="inline-flex min-h-12 items-center justify-center border border-primary bg-primary px-5 text-sm font-bold uppercase tracking-[0.18em] text-primary-foreground transition hover:bg-accent"
        >
          {label}
        </Link>
      </div>
    </section>
  );
}
