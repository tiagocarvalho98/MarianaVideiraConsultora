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

const heroImage = {
  src: "/images/home/hero.png",
  alt: "Imagem editorial fornecida para a homepage: interior contemporaneo com terraco e vista para o Tejo ao por do sol.",
} as const;

const marianaHomeImage = {
  src: "/Assets/mariana-home-cutout-premium.png",
  alt: "Mariana Videira, consultora imobiliária",
} as const;

type VisualEntry = {
  href: string;
  place: string;
  title: string;
  body: string;
  slot: "sell" | "buy";
  image: string | null;
  imageAlt: string | null;
  objectPosition: string;
};

const visualEntries: readonly VisualEntry[] = [
  {
    href: "/vender",
    place: "Montijo",
    title: "Vender",
    body: "Valorize o seu imovel",
    slot: "sell",
    image: "/Assets/vender.png",
    imageAlt: "Consultora e proprietário numa sala contemporânea com vista exterior.",
    objectPosition: "center center",
  },
  {
    href: "/comprar",
    place: "Alcochete",
    title: "Comprar",
    body: "Encontre o seu proximo lar",
    slot: "buy",
    image: "/Assets/Comprar.png",
    imageAlt: "Família à entrada de uma moradia contemporânea ao pôr do sol.",
    objectPosition: "center center",
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
          : "inline-flex min-h-12 items-center justify-center gap-3 border border-primary/45 px-6 text-xs font-bold uppercase tracking-[0.24em] text-primary transition duration-200 hover:bg-primary hover:text-primary-foreground"
      }
    >
      {children}
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}

function HomeHero() {
  return (
    <section className="relative isolate min-h-[88dvh] overflow-hidden bg-background lg:min-h-[calc(100dvh-5.5rem)]">
      <div className="absolute inset-x-0 top-0 z-0 h-px bg-primary/10" />
      <div className="absolute inset-0 z-0 lg:left-[39%]">
        <Image
          src={heroImage.src}
          alt={heroImage.alt}
          fill
          priority
          sizes="(min-width: 1024px) 62vw, 100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/82 via-background/24 to-background/86 lg:bg-gradient-to-r lg:from-background lg:via-background/58 lg:to-background/8" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_28%,rgba(214,174,120,0.18),transparent_34%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[88dvh] max-w-7xl items-center px-5 py-16 lg:min-h-[calc(100dvh-5.5rem)] lg:px-8">
        <div className="reveal-soft max-w-[46rem] pt-10 lg:max-w-[50rem] lg:pt-0">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.38em] text-primary">
            Montijo / Alcochete
          </p>
          <h1 className="mt-7 font-display text-[clamp(3.35rem,13vw,5.7rem)] font-medium leading-[0.9] text-foreground md:text-[clamp(5rem,8vw,7.7rem)] lg:max-w-[48rem] xl:text-[7.9rem]">
            <span className="hidden xl:inline">
              Confie o que mais valoriza
              <br />
              a quem sabe cuidar.
            </span>
            <span className="hidden md:inline xl:hidden">
              Confie o que mais
              <br />
              valoriza a quem
              <br />
              sabe cuidar.
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
          <p className="mt-7 max-w-xl text-base leading-8 text-foreground/72 md:text-lg">
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
      </div>
    </section>
  );
}

function PendingPhotoSurface({ slot }: { slot: "sell" | "buy" }) {
  const tone =
    slot === "sell"
      ? "from-background via-surface to-[#061b2d]"
      : "from-[#061b2d] via-surface to-background";

  return (
    <div
      className={`absolute inset-0 bg-gradient-to-br ${tone}`}
      aria-hidden="true"
    />
  );
}

function VisualEntrySection() {
  return (
    <section className="grid border-y border-primary/10 bg-[#020f1c] lg:h-[clamp(42rem,72vh,50rem)] lg:grid-cols-2">
      {visualEntries.map((entry) => (
        <Link
          key={entry.href}
          href={entry.href}
          className="group relative min-h-[35rem] overflow-hidden lg:min-h-0"
        >
          {entry.image ? (
            <Image
              src={entry.image}
              alt={entry.imageAlt ?? ""}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover transition duration-500 group-hover:scale-[1.02]"
              style={{ objectPosition: entry.objectPosition }}
            />
          ) : (
            <PendingPhotoSurface slot={entry.slot} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/88 via-background/42 to-background/16 transition duration-300 group-hover:from-background/80" />
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.38em] text-primary">
              {entry.place}
            </p>
            <h2 className="mt-4 font-display text-6xl font-medium uppercase leading-none text-foreground md:text-7xl">
              {entry.title}
            </h2>
            <div className="mt-5 flex items-center justify-between gap-5 border-t border-primary/20 pt-5">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-foreground/70">
                {entry.body}
              </p>
              <ArrowRight
                className="h-5 w-5 shrink-0 text-primary transition duration-200 group-hover:translate-x-1"
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
    <section className="luxury-section overflow-hidden border-b border-primary/10">
      <div className="relative mx-auto max-w-7xl px-5 pt-14 md:pt-16 lg:min-h-[clamp(48rem,82vh,58rem)] lg:px-8">
        <Image
          src={marianaHomeImage.src}
          alt={marianaHomeImage.alt}
          width={1316}
          height={2400}
          sizes="(min-width: 1280px) 44rem, (min-width: 1024px) 40rem, 108vw"
          className="pointer-events-none relative left-1/2 z-0 h-auto w-[min(108vw,35rem)] max-w-none -translate-x-1/2 lg:absolute lg:bottom-0 lg:left-0 lg:h-[clamp(43rem,76vh,55rem)] lg:w-auto lg:translate-x-0"
        />

        <div className="relative z-10 pt-8 pb-16 lg:ml-auto lg:max-w-[43rem] lg:pt-32 lg:pb-24 xl:pr-8">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.38em] text-primary">
            SOBRE
          </p>
          <div className="mt-7 max-w-4xl">
            <h2 className="font-display text-5xl font-medium leading-[0.96] text-foreground md:text-7xl">
              Relações que constroem
              <br />
              futuro.
            </h2>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-foreground/66">
              Acompanhamento próximo e criterioso para decisões imobiliárias
              com respeito pelo tempo, pelo contexto e pelo valor de cada
              património.
            </p>
            <div className="mt-10">
              <ArrowLink href="/sobre">Conhecer a Mariana</ArrowLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="bg-background">
      <div className="mx-auto px-5 py-20 text-center lg:px-8 lg:py-24">
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
