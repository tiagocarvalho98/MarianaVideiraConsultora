import Link from "next/link";
import { Search } from "lucide-react";
import { TypeBadge } from "@/components/crm/Badges";
import { PageIntro } from "@/components/crm/PageIntro";
import { getCrmRepository } from "@/lib/crm";
import { buildContactSummaries, searchContactSummaries } from "@/lib/crm/contact-search";
import { formatContactName, formatDateTime, formatStage } from "@/lib/crm/format";

type ContactSearchParams = {
  q?: string;
};

export default async function ContactosPage({
  searchParams,
}: {
  searchParams: Promise<ContactSearchParams>;
}) {
  const params = await searchParams;
  const query = params.q?.trim().toLowerCase() ?? "";
  const repository = getCrmRepository();
  const [contacts, opportunities] = await Promise.all([
    repository.getContacts(),
    repository.getOpportunities(),
  ]);
  const contactSummaries = buildContactSummaries(contacts, opportunities);
  const filteredContacts = searchContactSummaries(contactSummaries, query);

  return (
    <div>
      <PageIntro
        eyebrow="Pessoas"
        title="Contactos"
        description="Pessoas separadas das oportunidades comerciais. Um contacto pode ter varias oportunidades ao longo do tempo."
      />

      <form className="mb-4 rounded-2xl border border-border bg-white p-4 shadow-sm">
        <label className="grid gap-2 text-sm font-semibold text-stone-700">
          Pesquisar por nome, telefone ou email
          <div className="flex gap-2">
            <input
              name="q"
              defaultValue={params.q ?? ""}
              className="min-h-11 flex-1 rounded-xl border border-border bg-white px-3 text-sm text-stone-900"
            />
            <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white transition hover:bg-stone-900">
              <Search className="h-4 w-4" aria-hidden="true" />
              Procurar
            </button>
          </div>
        </label>
      </form>

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        {filteredContacts.map((contact) => {
          const latest = contact.latestOpportunity;

          return (
            <article
              key={contact.id}
              className="grid gap-3 border-b border-border p-4 last:border-b-0 lg:grid-cols-[1.1fr_1fr_1.4fr_auto]"
            >
              <div>
                <Link
                  href={`/crm/contactos/${contact.id}`}
                  className="font-bold text-stone-950 hover:text-primary"
                >
                  {formatContactName(contact.firstName, contact.lastName)}
                </Link>
                <p className="mt-1 text-sm text-stone-600">
                  {contact.opportunities.length} oportunidade
                  {contact.opportunities.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="text-sm text-stone-600">
                <a className="block hover:text-primary" href={`tel:${contact.phone}`}>
                  {contact.phone}
                </a>
                <span>{contact.email ?? "Sem email"}</span>
              </div>
              <div>
                {latest ? (
                  <div className="flex flex-wrap items-center gap-2 text-sm text-stone-700">
                    <TypeBadge type={latest.type} />
                    <span className="font-semibold">{formatStage(latest.stage)}</span>
                    <span className="text-stone-500">{formatDateTime(latest.createdAt)}</span>
                  </div>
                ) : (
                  <span className="text-sm text-stone-500">Sem oportunidades</span>
                )}
              </div>
              <Link
                href={`/crm/contactos/${contact.id}`}
                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-border px-3 text-sm font-bold text-stone-700 transition hover:border-primary hover:text-primary"
              >
                Abrir
              </Link>
            </article>
          );
        })}

        {filteredContacts.length === 0 ? (
          <div className="p-8 text-sm text-stone-600">
            Nenhum contacto corresponde a essa pesquisa.
          </div>
        ) : null}
      </div>
    </div>
  );
}
