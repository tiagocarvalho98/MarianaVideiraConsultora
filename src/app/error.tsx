"use client";

import Link from "next/link";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-5 py-16">
      <section className="max-w-xl rounded-2xl border border-border bg-white p-6 text-center shadow-sm">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
          Erro temporario
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold text-stone-950">
          Nao foi possivel carregar esta pagina.
        </h1>
        <p className="mt-4 text-stone-600">
          Tente novamente dentro de instantes. Se o problema persistir, use uma
          das paginas publicas para retomar a navegacao.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            onClick={reset}
            className="min-h-11 rounded-full bg-primary px-5 text-sm font-bold uppercase text-white"
          >
            Tentar novamente
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-border px-5 text-sm font-bold uppercase text-stone-800"
          >
            Voltar ao inicio
          </Link>
        </div>
      </section>
    </main>
  );
}
