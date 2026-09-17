import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { SellerLeadForm } from "@/components/public/LeadForms";
import { PublicShell } from "@/components/public/PublicShell";
import {
  CtaBand,
  EditorialBand,
  Hero,
  NumberedProcess,
  SectionIntro,
} from "@/components/public/Editorial";
import { brand } from "@/config/brand";
import { sellerFaq, sellerProcess, sellerThemes } from "@/data/public-content";

export const metadata: Metadata = {
  title: "Vender",
  description:
    "Preparar a venda de um imovel com estrategia, posicionamento, acompanhamento e negociacao cuidadosa.",
  alternates: { canonical: "/vender" },
};

const marianaRemaxImage = {
  src: "/Assets/mariana-remax-cutout-premium.png",
  alt: "Mariana Videira, consultora imobiliária",
} as const;

const sellHeroImage = {
  src: "/Assets/vender.png",
  alt: "Consultora e proprietário numa sala contemporânea com vista exterior.",
  objectPosition: "54% center",
} as const;

export default function SellPage() {
  return (
    <PublicShell>
      <main>
        <Hero
          eyebrow="Para proprietarios"
          title="Vender exige preparacao, nao apenas exposicao."
          body="Antes de colocar um imovel no mercado, importa perceber valor, contexto, timing e forma de apresentar."
          primaryHref="#formulario-vender"
          primaryLabel="Pedir contacto"
          image={sellHeroImage}
        />

        <EditorialBand>
          <SectionIntro
            eyebrow="Contexto"
            title="O valor de uma venda tambem esta na forma como e conduzida."
            body="Preco, preparacao, procura, visitas e negociacao precisam de uma linha coerente. A pagina existe para iniciar uma conversa qualificada, sem promessas artificiais."
          />
          <div className="mt-8 flex flex-wrap gap-2">
            {sellerThemes.map((theme) => (
              <span key={theme} className="border border-primary/30 px-3 py-1 text-sm font-bold text-primary/85">
                {theme}
              </span>
            ))}
          </div>
        </EditorialBand>

        <EditorialBand>
          <SectionIntro
            eyebrow="Processo"
            title="Uma venda bem acompanhada tem passos claros."
          />
          <div className="mt-8">
            <NumberedProcess items={sellerProcess} />
          </div>
        </EditorialBand>

        <section className="luxury-section overflow-hidden">
          <div className="relative mx-auto max-w-7xl px-5 pt-14 lg:min-h-[clamp(47rem,80vh,58rem)] lg:px-8">
            <Image
              src={marianaRemaxImage.src}
              alt={marianaRemaxImage.alt}
              width={1279}
              height={1996}
              sizes="(min-width: 1280px) 45rem, (min-width: 1024px) 40rem, 108vw"
              className="pointer-events-none relative left-1/2 z-0 h-auto w-[min(108vw,36rem)] max-w-none -translate-x-1/2 lg:absolute lg:bottom-0 lg:left-[-1rem] lg:h-[clamp(42rem,76vh,56rem)] lg:w-auto lg:translate-x-0"
            />
            <div className="relative z-10 mt-8 max-w-2xl pb-16 lg:ml-auto lg:mt-0 lg:pt-32 lg:pb-24">
              <SectionIntro
                eyebrow="Acompanhamento"
                title="Uma decisão importante pede presença e método."
                body="A venda começa por perceber o momento, preparar a apresentação e conduzir cada contacto com clareza. O objetivo é que avance com informação suficiente para decidir bem."
              />
            </div>
          </div>
        </section>

        <EditorialBand>
          <div id="formulario-vender" className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <SectionIntro
              eyebrow="Formulario vendedor"
              title="Conte o essencial sobre o imovel."
              body="Os campos recolhem apenas informacao util para uma primeira leitura e ficam registados para acompanhamento no CRM."
            />
            <Suspense fallback={<div className="border border-primary/24 bg-surface p-5 text-sm text-foreground/66">A carregar formulário.</div>}>
              <SellerLeadForm />
            </Suspense>
          </div>
        </EditorialBand>

        <EditorialBand>
          <SectionIntro title="Perguntas frequentes" />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {sellerFaq.map((item) => (
              <article key={item.question} className="border-t border-primary/24 pt-4">
                <h2 className="text-lg font-semibold text-foreground">{item.question}</h2>
                <p className="mt-3 text-sm leading-6 text-foreground/66">{item.answer}</p>
              </article>
            ))}
          </div>
        </EditorialBand>

        <CtaBand
          title={brand.tagline}
          body="Quando estiver pronto para falar sobre venda, comece por partilhar contexto."
          href="#formulario-vender"
          label="Pedir contacto"
        />
      </main>
    </PublicShell>
  );
}
