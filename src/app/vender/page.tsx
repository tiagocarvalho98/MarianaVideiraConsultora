import type { Metadata } from "next";
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

export default function SellPage() {
  return (
    <PublicShell>
      <main>
        <Hero
          eyebrow="Para proprietarios"
          title="Vender exige preparacao, nao apenas exposicao."
          body="Antes de colocar um imovel no mercado, importa perceber valor, contexto, timing e forma de apresentar. A Mariana acompanha esse processo com criterio e proximidade."
          primaryHref="#formulario-vender"
          primaryLabel="Pedir contacto"
          secondaryHref="/contacto"
          secondaryLabel="Falar com a Mariana"
        />

        <EditorialBand>
          <SectionIntro
            eyebrow="Contexto"
            title="O valor de uma venda tambem esta na forma como e conduzida."
            body="Preco, preparacao, procura, visitas e negociacao precisam de uma linha coerente. A pagina existe para iniciar uma conversa qualificada, sem promessas artificiais."
          />
          <div className="mt-8 flex flex-wrap gap-2">
            {sellerThemes.map((theme) => (
              <span key={theme} className="rounded-full border border-stone-300 px-3 py-1 text-sm font-bold text-stone-700">
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

        <EditorialBand>
          <div id="formulario-vender" className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <SectionIntro
              eyebrow="Formulario vendedor"
              title="Conte o essencial sobre o imovel."
              body="Os campos recolhem apenas informacao util para uma primeira leitura e ficam registados para acompanhamento no CRM."
            />
            <Suspense fallback={<div className="rounded-[1.5rem] border border-stone-200 bg-white p-5 text-sm text-stone-600">A preparar formulario.</div>}>
              <SellerLeadForm />
            </Suspense>
          </div>
        </EditorialBand>

        <EditorialBand>
          <SectionIntro title="Perguntas frequentes" />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {sellerFaq.map((item) => (
              <article key={item.question} className="border-t border-stone-300 pt-4">
                <h2 className="text-lg font-bold text-stone-950">{item.question}</h2>
                <p className="mt-3 text-sm leading-6 text-stone-700">{item.answer}</p>
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
