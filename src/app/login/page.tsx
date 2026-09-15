import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh lg:grid-cols-[0.95fr_1.05fr]">
      <section className="flex items-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-md">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent">
            CRM privado
          </p>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-tight">
            Entrar na area de acompanhamento comercial.
          </h1>
          <p className="mt-4 text-stone-600">
            Acesso reservado a Mariana, Tiago e utilizadores autorizados.
          </p>
          <div className="mt-8 rounded-2xl border border-border bg-surface p-5 shadow-soft">
            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </section>
      <section className="hidden bg-primary text-primary-foreground lg:flex lg:items-end">
        <div className="p-16">
          <p className="max-w-xl font-display text-5xl font-semibold leading-tight">
            Confie o que mais valoriza a quem sabe cuidar.
          </p>
          <p className="mt-6 max-w-md text-primary-foreground/75">
            Foundation visual temporaria. A fotografia real da Mariana deve ser
            a peca principal na fase publica.
          </p>
        </div>
      </section>
    </main>
  );
}
