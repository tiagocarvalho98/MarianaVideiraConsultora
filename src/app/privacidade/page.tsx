import type { Metadata } from "next";
import { PublicShell } from "@/components/public/PublicShell";
import { EditorialBand, SectionIntro } from "@/components/public/Editorial";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: "Privacidade",
  description:
    "Informacao preliminar sobre privacidade. Validacao juridica necessaria antes de publicacao final.",
  alternates: { canonical: "/privacidade" },
};

export default function PrivacyPage() {
  return (
    <PublicShell>
      <main>
        <EditorialBand>
          <SectionIntro
            eyebrow="Privacidade"
            title="Politica de privacidade em preparacao."
            body="Este texto estrutura os pontos necessarios, mas nao deve ser tratado como aconselhamento juridico final."
          />
          <div className="mt-10 grid gap-6 leading-7 text-stone-700">
            <section className="border-t border-stone-300 pt-5">
              <h2 className="text-xl font-bold text-stone-950">Entidade responsavel</h2>
              <p className="mt-3">
                Responsavel a validar: {brand.fullName}, {brand.company}, {brand.network}.
              </p>
            </section>
            <section className="border-t border-stone-300 pt-5">
              <h2 className="text-xl font-bold text-stone-950">Dados recolhidos</h2>
              <p className="mt-3">
                Os formularios podem recolher nome, telefone, email opcional, contexto de compra/venda e consentimento de privacidade.
              </p>
            </section>
            <section className="border-t border-stone-300 pt-5">
              <h2 className="text-xl font-bold text-stone-950">Finalidades</h2>
              <p className="mt-3">
                Contacto comercial, qualificacao de oportunidade imobiliaria e acompanhamento solicitado pela pessoa que submete o formulario.
              </p>
            </section>
            <section className="border-t border-stone-300 pt-5">
              <h2 className="text-xl font-bold text-stone-950">A validar antes de producao</h2>
              <ul className="mt-3 grid gap-2">
                <li>Base legal aplicavel.</li>
                <li>Periodo de retencao.</li>
                <li>Subprocessadores e ferramentas usadas.</li>
                <li>Contacto final para direitos de titulares.</li>
                <li>Texto final aprovado juridicamente.</li>
              </ul>
            </section>
          </div>
        </EditorialBand>
      </main>
    </PublicShell>
  );
}
