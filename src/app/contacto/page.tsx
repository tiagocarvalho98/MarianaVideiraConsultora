import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { PublicShell } from "@/components/public/PublicShell";
import { SectionIntro } from "@/components/public/Editorial";
import { ContactForm } from "@/components/public/LeadForms";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Contactos de Mariana Videira e formulario visual de contacto para acompanhamento imobiliario.",
  alternates: { canonical: "/contacto" },
};

const marianaContactImage = {
  src: "/Assets/mariana-contact-cutout-premium.png",
  alt: "Mariana Videira, consultora imobiliária",
} as const;

const contactItems = [
  { label: "Telefone", value: brand.phone },
  { label: "Email", value: brand.email },
  { label: "WhatsApp", value: brand.whatsapp },
  { label: "Instagram", value: brand.instagram },
].filter((item) => item.value && !item.value.includes("["));

export default function ContactPage() {
  return (
    <PublicShell>
      <main>
        <section className="luxury-section overflow-hidden">
          <div className="relative mx-auto max-w-7xl px-5 pt-14 lg:min-h-[clamp(50rem,84vh,60rem)] lg:px-8">
            <Image
              src={marianaContactImage.src}
              alt={marianaContactImage.alt}
              width={1024}
              height={1536}
              priority
              sizes="(min-width: 1280px) 56rem, (min-width: 1024px) 51rem, 140vw"
              className="pointer-events-none relative left-1/2 z-0 h-auto w-[min(140vw,45.5rem)] max-w-none -translate-x-1/2 lg:absolute lg:bottom-0 lg:left-[-1rem] lg:h-[clamp(57.2rem,101vh,72.8rem)] lg:w-auto lg:translate-x-0"
            />

            <div className="relative z-10 mt-8 grid gap-8 pb-16 lg:ml-auto lg:mt-0 lg:max-w-[42rem] lg:pt-16 lg:pb-24">
              <SectionIntro
                eyebrow="Contacto"
                title="Fale com a Mariana."
                body="Partilhe o momento em que se encontra para iniciar uma conversa com contexto."
              />

              {contactItems.length > 0 ? (
                <section className="border-t border-primary/24 pt-5">
                  <h2 className="text-xl font-semibold text-foreground">Contacto direto</h2>
                  <dl className="mt-5 grid gap-4 text-sm">
                    {contactItems.map((item) => (
                      <div key={item.label}>
                        <dt className="font-bold text-primary/78">{item.label}</dt>
                        <dd className="mt-1 text-foreground/76">{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ) : null}

              <section className="border-t border-primary/24 pt-5">
                <h2 className="text-xl font-semibold text-foreground">Áreas de atuação</h2>
                <p className="mt-3 text-sm leading-6 text-foreground/68">
                  {brand.serviceAreas.slice(0, 2).join(" e ")}
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-xl font-semibold text-foreground">Formulario simples</h2>
                <Suspense fallback={<div className="border border-primary/24 bg-surface p-5 text-sm text-foreground/66">A carregar formulário.</div>}>
                  <ContactForm />
                </Suspense>
              </section>
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
