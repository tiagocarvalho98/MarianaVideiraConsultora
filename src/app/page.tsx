import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PublicShell } from "@/components/public/PublicShell";

export const metadata: Metadata = {
  title: "Inicio",
  description:
    "Acompanhamento imobiliario em Montijo e Alcochete para vender ou comprar com criterio, confianca e cuidado.",
  alternates: { canonical: "/" },
};

const visualEntries = [
  {
    href: "/vender",
    image: "/placeholders/seller-interior-placeholder.svg",
    place: "Montijo",
    title: "Vender",
    body: "Valorize o seu imovel",
    alt: "Placeholder editorial de interior premium para substituir por fotografia aprovada.",
  },
  {
    href: "/comprar",
    image: "/placeholders/buyer-terrace-placeholder.svg",
    place: "Alcochete",
    title: "Comprar",
    body: "Encontre o seu proximo lar",
    alt: "Placeholder editorial de terraco contemporaneo para substituir por fotografia aprovada.",
  },
] as const;

function ArrowLink({
  href,
  children,
  variant = "outline",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "filled" | "outline";
}) {
  return (
    <Link
      href={href}
      className={
        variant === "filled"
          ? "inline-flex min-h-12 items-center justify-center gap-3 border border-primary bg-primary px-6 text-xs font-bold uppercase tracking-[0.24em] text-primary-foreground transition duration-200 hover:bg-accent"
          : "inline-flex min-h-12 items-center justify-center gap-3 border border-primary/55 px-6 text-xs font-bold uppercase tracking-[0.24em] text-primary transition duration-200 hover:bg-primary hover:text-primary-foreground"
      }
    >
      {children}
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}

function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="mx-auto grid min-h-[86dvh] max-w-7xl gap-12 px-5 py-14 md:min-h-[90dvh] lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:px-8 lg:py-20">
        <div className="reveal-soft relative z-10">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.38em] text-primary">
            Montijo / Alcochete
          </p>
          <h1 className="mt-7 max-w-4xl font-display text-[clamp(3.65rem,14vw,8rem)] font-medium leading-[0.86] text-foreground md:text-[clamp(5.5rem,8vw,8rem)]">
            <span className="hidden md:inline">
              Confie o que mais valoriza
              <br />
              a quem sabe cuidar.
            </span>
            <span className="md:hidden">
              Confie o que
              <br />
              mais valoriza
              <br />
              a quem sabe
              <br />
              cuidar.
            </span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-8 text-foreground/66 md:text-lg">
            Acompanhamento imobiliario com presenca, criterio e atencao ao
            patrimonio que esta em decisao.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ArrowLink href="/vender" variant="filled">
              Vender um imovel
            </ArrowLink>
            <ArrowLink href="/comprar">Comprar um imovel</ArrowLink>
          </div>
        </div>

        <div className="relative min-h-[24rem] lg:min-h-[44rem]">
          <div className="absolute inset-x-8 top-0 hidden h-px bg-primary/35 lg:block" />
          <div className="relative h-full min-h-[24rem] overflow-hidden border border-primary/18 bg-surface lg:min-h-[44rem]">
            <Image
              src="/placeholders/architecture-hero-placeholder.svg"
              alt="Placeholder editorial de arquitetura contemporanea. Substituir por fotografia licenciada de Montijo ou Alcochete quando aprovada."
              fill
              priority
              sizes="(min-width: 1024px) 54vw, 100vw"
              className="object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/76 via-background/12 to-transparent lg:from-background/28" />
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4 border-t border-primary/28 pt-5">
              <p className="max-w-xs text-xs leading-6 text-foreground/58">
                Placeholder editorial. Substituir por fotografia real licenciada.
              </p>
              <span className="hidden text-[0.62rem] font-bold uppercase tracking-[0.34em] text-primary/78 sm:inline">
                Patrimonio / cuidado
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="fine-line mx-auto max-w-7xl" />
    </section>
  );
}

function VisualEntrySection() {
  return (
    <section className="grid border-y border-primary/18 bg-[#020f1c] lg:grid-cols-2">
      {visualEntries.map((entry) => (
        <Link
          key={entry.href}
          href={entry.href}
          className="group relative min-h-[34rem] overflow-hidden border-primary/18 lg:border-r"
        >
          <Image
            src={entry.image}
            alt={entry.alt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-[1.025]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/46 to-background/10" />
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.38em] text-primary">
              {entry.place}
            </p>
            <h2 className="mt-4 font-display text-6xl font-medium uppercase leading-none text-foreground md:text-7xl">
              {entry.title}
            </h2>
            <div className="mt-5 flex items-center justify-between gap-5 border-t border-primary/35 pt-5">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-foreground/70">
                {entry.body}
              </p>
              <ArrowRight
                className="h-5 w-5 shrink-0 text-primary transition group-hover:translate-x-1"
                aria-hidden="true"
              />
            </div>
          </div>
        </Link>
      ))}
    </section>
  );
}

function MarianaSection() {
  return (
    <section className="luxury-section border-b border-primary/14">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-24 lg:grid-cols-[0.35fr_0.65fr] lg:px-8">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.38em] text-primary">
          Sobre
        </p>
        <div>
          <h2 className="max-w-4xl font-display text-5xl font-medium leading-[0.96] text-foreground md:text-7xl">
            Relacoes que constroem futuro.
          </h2>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-foreground/66">
            Uma presenca proxima e criteriosa para acompanhar decisoes
            imobiliarias com respeito pelo tempo, pelo contexto e pelo valor de
            cada patrimonio.
          </p>
          <div className="mt-10">
            <ArrowLink href="/sobre">Conhecer a Mariana</ArrowLink>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="bg-background">
      <div className="mx-auto px-5 py-24 text-center lg:px-8">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.38em] text-primary">
          Proximo passo
        </p>
        <h2 className="mx-auto mt-6 max-w-4xl font-display text-5xl font-medium leading-[0.96] text-foreground md:text-7xl">
          Esta a pensar vender
          <br />
          ou comprar?
        </h2>
        <div className="mt-10 flex justify-center">
          <ArrowLink href="/contacto" variant="filled">
            Falar comigo
          </ArrowLink>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <PublicShell>
      <main>
        <HomeHero />
        <VisualEntrySection />
        <MarianaSection />
        <FinalCta />
      </main>
    </PublicShell>
  );
}
