import type { Metadata } from "next";
import Image from "next/image";
import { PublicShell } from "@/components/public/PublicShell";
import { CtaBand, EditorialBand, SectionIntro, TextColumns } from "@/components/public/Editorial";
import { brand } from "@/config/brand";
import { workingPrinciples } from "@/data/public-content";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "Conheca a abordagem de Mariana Videira ao acompanhamento imobiliario, com foco em cuidado, criterio e proximidade.",
  alternates: { canonical: "/sobre" },
};

const marianaAboutImage = {
  src: "/Assets/mariana-about-cutout-premium.png",
  alt: "Mariana Videira, consultora imobiliária",
} as const;

export default function AboutPage() {
  return (
    <PublicShell>
      <main>
        <section className="luxury-section overflow-hidden border-b border-primary/14">
          <div className="relative mx-auto max-w-7xl px-5 pt-14 lg:min-h-[clamp(50rem,84vh,60rem)] lg:px-8">
            <Image
              src={marianaAboutImage.src}
              alt={marianaAboutImage.alt}
              width={1487}
              height={2400}
              priority
              sizes="(min-width: 1280px) 45rem, (min-width: 1024px) 40rem, 108vw"
              className="pointer-events-none relative left-1/2 z-0 h-auto w-[min(108vw,36rem)] max-w-none -translate-x-1/2 lg:absolute lg:bottom-0 lg:left-[-1rem] lg:h-[clamp(46rem,80vh,58rem)] lg:w-auto lg:translate-x-0"
            />
            <div className="relative z-10 pt-8 pb-14 lg:ml-auto lg:max-w-[42rem] lg:pt-36 lg:pb-28">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.34em] text-primary">
                Sobre
              </p>
              <h1 className="mt-5 max-w-4xl font-display text-5xl font-medium leading-[0.96] text-foreground md:text-7xl">
                Uma presença profissional com critério e proximidade.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-foreground/68">
                Uma abordagem próxima e criteriosa para decisões imobiliárias
                que pedem tempo, contexto e cuidado.
              </p>
            </div>
          </div>
        </section>

        <EditorialBand>
          <SectionIntro
            eyebrow="Apresentacao"
            title={`${brand.fullName}, ${brand.role}.`}
            body="Acompanhamento imobiliário com foco em escuta, preparação e clareza nos próximos passos."
          />
        </EditorialBand>

        <EditorialBand>
          <SectionIntro
            eyebrow="Filosofia"
            title="Proximidade com estrutura."
            body="A abordagem publica deve transmitir cuidado, autoridade e acompanhamento, sem exageros promocionais nem frases vazias."
          />
          <div className="mt-10">
            <TextColumns items={workingPrinciples} />
          </div>
        </EditorialBand>

        <EditorialBand>
          <div className="grid gap-8 md:grid-cols-3">
            <article className="border-t border-primary/24 pt-4">
              <h2 className="text-xl font-semibold text-foreground">Acompanhamento</h2>
              <p className="mt-3 leading-7 text-foreground/66">
                Presença próxima ao longo da decisão, com atenção ao contexto de cada pessoa e cada imóvel.
              </p>
            </article>
            <article className="border-t border-primary/24 pt-4">
              <h2 className="text-xl font-semibold text-foreground">Conhecimento local</h2>
              <p className="mt-3 leading-7 text-foreground/66">
                Acompanhamento focado em {brand.serviceAreas.slice(0, 2).join(" e ")}.
              </p>
            </article>
            <article className="border-t border-primary/24 pt-4">
              <h2 className="text-xl font-semibold text-foreground">Critério</h2>
              <p className="mt-3 leading-7 text-foreground/66">
                Comunicação clara, preparação cuidadosa e decisões sustentadas por informação útil.
              </p>
            </article>
          </div>
        </EditorialBand>

        <CtaBand
          title="Falar com criterio desde o primeiro contacto."
          body="Se esta a ponderar vender ou comprar, comece por explicar o momento em que se encontra."
          href="/contacto"
          label="Contacto"
        />
      </main>
    </PublicShell>
  );
}
