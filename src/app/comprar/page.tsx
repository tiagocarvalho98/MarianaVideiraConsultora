import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { BuyerLeadForm } from "@/components/public/LeadForms";
import { PublicShell } from "@/components/public/PublicShell";
import {
  CtaBand,
  EditorialBand,
  Hero,
  NumberedProcess,
  SectionIntro,
} from "@/components/public/Editorial";
import { brand } from "@/config/brand";
import { buyerFaq, buyerProcess, buyerThemes } from "@/data/public-content";

export const metadata: Metadata = {
  title: "Comprar",
  description:
    "Acompanhamento para compradores: perceber necessidades, filtrar opcoes e preparar decisao com criterio.",
  alternates: { canonical: "/comprar" },
};

const marianaKeysImage = {
  src: "/Assets/mariana-keys-cutout-premium.png",
  alt: "Mariana Videira, consultora imobiliária",
} as const;

const buyHeroImage = {
  src: "/Assets/Comprar.png",
  alt: "Família à entrada de uma moradia contemporânea ao pôr do sol.",
  objectPosition: "48% center",
} as const;

export default function BuyPage() {
  return (
    <PublicShell>
      <main>
        <Hero
          eyebrow="Para compradores"
          title="Comprar melhor com menos ruido."
          body="A compra ganha clareza quando zonas, orcamento, financiamento, prioridades e timing estao bem definidos."
          primaryHref="#formulario-comprar"
          primaryLabel="Pedir acompanhamento"
          image={buyHeroImage}
        />

        <EditorialBand>
          <SectionIntro
            eyebrow="Acompanhamento"
            title="O objetivo nao e mostrar tudo. E filtrar melhor."
            body="Uma boa compra depende de informacao concreta e escolhas com criterio. O acompanhamento começa por perceber o que realmente importa antes de avancar."
          />
          <div className="mt-8 flex flex-wrap gap-2">
            {buyerThemes.map((theme) => (
              <span key={theme} className="border border-primary/30 px-3 py-1 text-sm font-bold text-primary/85">
                {theme}
              </span>
            ))}
          </div>
        </EditorialBand>

        <EditorialBand>
          <SectionIntro
            eyebrow="Processo"
            title="Da procura ao proximo passo."
          />
          <div className="mt-8">
            <NumberedProcess items={buyerProcess} />
          </div>
        </EditorialBand>

        <section className="luxury-section overflow-hidden">
          <div className="relative mx-auto max-w-7xl px-5 pt-14 lg:min-h-[clamp(47rem,80vh,58rem)] lg:px-8">
            <Image
              src={marianaKeysImage.src}
              alt={marianaKeysImage.alt}
              width={1575}
              height={2400}
              sizes="(min-width: 1280px) 44rem, (min-width: 1024px) 39rem, 108vw"
              className="pointer-events-none relative left-1/2 z-0 h-auto w-[min(108vw,36rem)] max-w-none -translate-x-1/2 lg:absolute lg:bottom-0 lg:right-[-7rem] lg:h-[clamp(43rem,78vh,56rem)] lg:w-auto lg:translate-x-0 xl:right-[-4rem]"
            />
            <div className="relative z-10 mt-8 max-w-2xl pb-16 lg:mt-0 lg:max-w-[34rem] lg:pt-32 lg:pb-24 xl:max-w-[38rem]">
              <SectionIntro
                eyebrow="Acompanhamento"
                title="Da filtragem à decisão, com próximos passos claros."
                body="A compra beneficia de uma leitura cuidada das prioridades, do orçamento e do timing. O acompanhamento ajuda a transformar procura dispersa numa decisão mais preparada."
              />
            </div>
          </div>
        </section>

        <EditorialBand>
          <div id="formulario-comprar" className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <SectionIntro
              eyebrow="Formulario comprador"
              title="Partilhe o que procura."
              body="O formulario ajuda a qualificar zonas, tipologia, orcamento e preparacao financeira, ficando registado para acompanhamento no CRM."
            />
            <Suspense fallback={<div className="border border-primary/24 bg-surface p-5 text-sm text-foreground/66">A carregar formulário.</div>}>
              <BuyerLeadForm />
            </Suspense>
          </div>
        </EditorialBand>

        <EditorialBand>
          <SectionIntro title="Perguntas frequentes" />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {buyerFaq.map((item) => (
              <article key={item.question} className="border-t border-primary/24 pt-4">
                <h2 className="text-lg font-semibold text-foreground">{item.question}</h2>
                <p className="mt-3 text-sm leading-6 text-foreground/66">{item.answer}</p>
              </article>
            ))}
          </div>
        </EditorialBand>

        <CtaBand
          title={brand.tagline}
          body="Quando a procura esta clara, cada visita e cada proposta ganham mais sentido."
          href="#formulario-comprar"
          label="Pedir acompanhamento"
        />
      </main>
    </PublicShell>
  );
}
