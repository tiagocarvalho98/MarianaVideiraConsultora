import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-5 py-16">
      <section className="max-w-xl rounded-2xl border border-border bg-white p-6 text-center shadow-sm">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
          Pagina nao encontrada
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold text-stone-950">
          Esta pagina nao existe.
        </h1>
        <p className="mt-4 text-stone-600">
          O endereco pode ter mudado ou a pagina pode estar indisponivel.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-bold uppercase text-white"
        >
          Voltar ao inicio
        </Link>
      </section>
    </main>
  );
}
