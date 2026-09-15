import type { Metadata } from "next";
import { Suspense } from "react";
import { PublicShell } from "@/components/public/PublicShell";
import { EditorialBand, SectionIntro } from "@/components/public/Editorial";
import { ContactForm } from "@/components/public/LeadForms";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Contactos de Mariana Videira e formulario visual de contacto para acompanhamento imobiliario.",
  alternates: { canonical: "/contacto" },
};

export default function ContactPage() {
  return (
    <PublicShell>
      <main>
        <EditorialBand>
          <SectionIntro
            eyebrow="Contacto"
            title="Fale com a Mariana."
            body="Os contactos abaixo estao centralizados na configuracao da marca. Substituir placeholders quando os dados finais forem fornecidos."
          />
          <div className="mt-10 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <section className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-stone-950">Contacto direto</h2>
              <dl className="mt-5 grid gap-4 text-sm">
                <div>
                  <dt className="font-bold text-stone-500">Telefone</dt>
                  <dd className="mt-1 text-stone-950">{brand.phone}</dd>
                </div>
                <div>
                  <dt className="font-bold text-stone-500">Email</dt>
                  <dd className="mt-1 text-stone-950">{brand.email}</dd>
                </div>
                <div>
                  <dt className="font-bold text-stone-500">WhatsApp</dt>
                  <dd className="mt-1 text-stone-950">{brand.whatsapp}</dd>
                </div>
                <div>
                  <dt className="font-bold text-stone-500">Instagram</dt>
                  <dd className="mt-1 text-stone-950">{brand.instagram}</dd>
                </div>
                <div>
                  <dt className="font-bold text-stone-500">Areas de atuacao</dt>
                  <dd className="mt-1 text-stone-950">{brand.serviceAreas.join(", ")}</dd>
                </div>
              </dl>
            </section>
            <section>
              <h2 className="mb-4 text-xl font-bold text-stone-950">Formulario simples</h2>
              <Suspense fallback={<div className="rounded-[1.5rem] border border-stone-200 bg-white p-5 text-sm text-stone-600">A preparar formulario.</div>}>
                <ContactForm />
              </Suspense>
            </section>
          </div>
        </EditorialBand>
      </main>
    </PublicShell>
  );
}
