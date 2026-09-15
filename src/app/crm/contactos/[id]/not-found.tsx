import Link from "next/link";

export default function ContactNotFound() {
  return (
    <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-stone-950">Contacto nao encontrado</h1>
      <p className="mt-2 text-sm text-stone-600">
        Este contacto nao existe nos dados atuais ou deixou de estar disponivel.
      </p>
      <Link
        href="/crm/contactos"
        className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-bold text-white transition hover:bg-stone-900"
      >
        Voltar aos contactos
      </Link>
    </div>
  );
}
