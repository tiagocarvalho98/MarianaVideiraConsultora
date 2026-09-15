import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/public/PublicShell";
import {
  CtaBand,
  EditorialBand,
  Hero,
  NumberedProcess,
  SectionIntro,
  TextColumns,
} from "@/components/public/Editorial";
import { brand } from "@/config/brand";
import { buyerProcess, sellerProcess, workingPrinciples } from "@/data/public-content";

export const metadata: Metadata = {
  title: "Inicio",
  description:
    "Acompanhamento imobiliario em Montijo, Alcochete, Setubal e Margem Sul com criterio, proximidade e estrategia.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <PublicShell>
      <main>
        <Hero
          eyebrow={brand.role}
          title={brand.fullName}
          body={`${brand.tagline} Acompanhamento imobiliario com escuta, preparacao e uma estrategia clara para vender ou comprar com mais seguranca.`}
          primaryHref="/vender"
          primaryLabel="Quero vender"
          secondaryHref="/comprar"
          secondaryLabel="Quero comprar"
        />

        <EditorialBand>
          <SectionIntro
            eyebrow="Posicionamento"
            title="Imobiliario com cuidado comercial, nao com pressa decorativa."
            body="A decisao de vender ou comprar pede contexto, informacao e seguimento. A proposta desta presenca digital e simples: captar boas conversas e garantir que cada oportunidade relevante tem proximo passo."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <Link href="/vender" className="group border-t border-stone-300 pt-5">
              <span className="font-mono text-xs uppercase text-accent">Para proprietarios</span>
              <h2 className="mt-3 font-display text-4xl font-semibold text-stone-950 group-hover:text-primary">
                Vender com preparacao
              </h2>
              <p className="mt-4 leading-7 text-stone-700">
                Valor, timing, apresentacao, procura e negociacao tratados com criterio antes de avancar.
              </p>
            </Link>
            <Link href="/comprar" className="group border-t border-stone-300 pt-5">
              <span className="font-mono text-xs uppercase text-accent">Para compradores</span>
              <h2 className="mt-3 font-display text-4xl font-semibold text-stone-950 group-hover:text-primary">
                Comprar com filtro
              </h2>
              <p className="mt-4 leading-7 text-stone-700">
                Menos ruido, melhor qualificacao e acompanhamento para decidir com mais clareza.
              </p>
            </Link>
          </div>
        </EditorialBand>

        <EditorialBand>
          <SectionIntro
            eyebrow="Forma de trabalhar"
            title="Poucos passos, bem acompanhados."
            body="A simplicidade operacional tambem se sente no contacto publico: entender, preparar, acompanhar e fechar o ciclo com respeito pelo tempo de cada pessoa."
          />
          <div className="mt-10">
            <TextColumns items={workingPrinciples} />
          </div>
        </EditorialBand>

        <EditorialBand>
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <SectionIntro title="Processo para vender" />
              <div className="mt-8">
                <NumberedProcess items={sellerProcess} />
              </div>
            </div>
            <div>
              <SectionIntro title="Processo para comprar" />
              <div className="mt-8">
                <NumberedProcess items={buyerProcess} />
              </div>
            </div>
          </div>
        </EditorialBand>

        <EditorialBand>
          <SectionIntro
            eyebrow="Area de atuacao"
            title="Foco local, leitura humana."
            body={`Zonas preparadas em configuracao: ${brand.serviceAreas.join(", ")}. Ajustar quando a Mariana confirmar areas finais de trabalho.`}
          />
        </EditorialBand>

        <CtaBand
          title="Comecar pela conversa certa."
          body="Escolha o caminho mais proximo do seu momento: vender, comprar ou falar diretamente com a Mariana."
          href="/contacto"
          label="Falar com a Mariana"
        />
      </main>
    </PublicShell>
  );
}
