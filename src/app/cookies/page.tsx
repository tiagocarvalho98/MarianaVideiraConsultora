import type { Metadata } from "next";
import { PublicShell } from "@/components/public/PublicShell";
import { EditorialBand, SectionIntro } from "@/components/public/Editorial";

export const metadata: Metadata = {
  title: "Cookies",
  description:
    "Informacao preliminar sobre cookies. Ainda nao existem cookies nao essenciais ou analytics reais implementados.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <PublicShell>
      <main>
        <EditorialBand>
          <SectionIntro
            eyebrow="Cookies"
            title="Cookies e ferramentas em preparacao."
            body="Nesta fase nao foi implementado banner complexo porque ainda nao existem cookies nao essenciais, analytics reais, pixel ou automacoes ligados."
          />
          <div className="mt-10 grid gap-6 leading-7 text-stone-700">
            <section className="border-t border-stone-300 pt-5">
              <h2 className="text-xl font-bold text-stone-950">Estado atual</h2>
              <p className="mt-3">
                O website esta preparado para captar parametros de campanha nos formularios visuais, mas nao persiste submissao nem ativa tracking real.
              </p>
            </section>
            <section className="border-t border-stone-300 pt-5">
              <h2 className="text-xl font-bold text-stone-950">A validar no futuro</h2>
              <ul className="mt-3 grid gap-2">
                <li>Cookies tecnicos efetivamente usados.</li>
                <li>Ferramentas de analytics futuras.</li>
                <li>Meta Pixel, Google Ads ou outras plataformas, se forem ligadas.</li>
                <li>Preferencias de consentimento e mecanismo de revogacao.</li>
              </ul>
            </section>
          </div>
        </EditorialBand>
      </main>
    </PublicShell>
  );
}
