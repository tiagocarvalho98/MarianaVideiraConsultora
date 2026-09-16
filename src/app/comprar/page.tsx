import type { Metadata } from "next";
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

export default function BuyPage() {
  return (
    <PublicShell>
      <main>
        <Hero
          eyebrow="Para compradores"
          title="Comprar melhor com menos ruido."
          body="A compra ganha clareza quando a procura e bem qualificada: zonas, orcamento, financiamento, prioridades e timing antes de multiplicar visitas sem direcao."
          primaryHref="#formulario-comprar"
          primaryLabel="Pedir acompanhamento"
          secondaryHref="/contacto"
          secondaryLabel="Falar com a Mariana"
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

        <EditorialBand>
          <div id="formulario-comprar" className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <SectionIntro
              eyebrow="Formulario comprador"
              title="Partilhe o que procura."
              body="O formulario ajuda a qualificar zonas, tipologia, orcamento e preparacao financeira, ficando registado para acompanhamento no CRM."
            />
            <Suspense fallback={<div className="border border-primary/24 bg-surface p-5 text-sm text-foreground/66">A preparar formulario.</div>}>
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
