import type { Metadata } from "next";
import { PublicShell } from "@/components/public/PublicShell";
import { CtaBand, EditorialBand, Hero, SectionIntro, TextColumns } from "@/components/public/Editorial";
import { brand } from "@/config/brand";
import { workingPrinciples } from "@/data/public-content";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "Conheca a abordagem de Mariana Videira ao acompanhamento imobiliario, com foco em cuidado, criterio e proximidade.",
  alternates: { canonical: "/sobre" },
};

export default function AboutPage() {
  return (
    <PublicShell>
      <main>
        <Hero
          eyebrow="Sobre"
          title="Uma presenca profissional ainda a ganhar conteudo real."
          body="Esta pagina prepara a estrutura editorial para a apresentacao da Mariana. Biografia, percurso, credenciais e fotografia final devem ser preenchidos apenas com informacao confirmada."
          primaryHref="/contacto"
          primaryLabel="Falar com a Mariana"
          secondaryHref="/vender"
          secondaryLabel="Quero vender"
        />

        <EditorialBand>
          <SectionIntro
            eyebrow="Apresentacao"
            title={`${brand.fullName}, ${brand.role}.`}
            body="[Placeholder: texto biografico real a fornecer pela Mariana. Nao adicionar anos de experiencia, premios, volume de vendas ou credenciais sem confirmacao.]"
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
            <article className="border-t border-stone-300 pt-4">
              <h2 className="text-xl font-bold text-stone-950">Experiencia</h2>
              <p className="mt-3 leading-7 text-stone-700">
                [Placeholder: experiencia profissional confirmada.]
              </p>
            </article>
            <article className="border-t border-stone-300 pt-4">
              <h2 className="text-xl font-bold text-stone-950">Conhecimento local</h2>
              <p className="mt-3 leading-7 text-stone-700">
                Areas em configuracao: {brand.serviceAreas.join(", ")}.
              </p>
            </article>
            <article className="border-t border-stone-300 pt-4">
              <h2 className="text-xl font-bold text-stone-950">Rede</h2>
              <p className="mt-3 leading-7 text-stone-700">
                {brand.company} · {brand.network}
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
