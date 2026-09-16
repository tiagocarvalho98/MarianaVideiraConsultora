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
            <section className="border border-primary/24 bg-surface p-5">
              <h2 className="text-xl font-semibold text-foreground">Contacto direto</h2>
              <dl className="mt-5 grid gap-4 text-sm">
                <div>
                  <dt className="font-bold text-primary/78">Telefone</dt>
                  <dd className="mt-1 text-foreground/76">{brand.phone}</dd>
                </div>
                <div>
                  <dt className="font-bold text-primary/78">Email</dt>
                  <dd className="mt-1 text-foreground/76">{brand.email}</dd>
                </div>
                <div>
                  <dt className="font-bold text-primary/78">WhatsApp</dt>
                  <dd className="mt-1 text-foreground/76">{brand.whatsapp}</dd>
                </div>
                <div>
                  <dt className="font-bold text-primary/78">Instagram</dt>
                  <dd className="mt-1 text-foreground/76">{brand.instagram}</dd>
                </div>
                <div>
                  <dt className="font-bold text-primary/78">Areas de atuacao</dt>
                  <dd className="mt-1 text-foreground/76">{brand.serviceAreas.join(", ")}</dd>
                </div>
              </dl>
            </section>
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">Formulario simples</h2>
              <Suspense fallback={<div className="border border-primary/24 bg-surface p-5 text-sm text-foreground/66">A preparar formulario.</div>}>
                <ContactForm />
              </Suspense>
            </section>
          </div>
        </EditorialBand>
      </main>
    </PublicShell>
  );
}
