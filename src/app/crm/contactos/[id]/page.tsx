import Link from "next/link";
import { notFound } from "next/navigation";
import { OpportunityCard } from "@/components/crm/OpportunityCard";
import { PageIntro } from "@/components/crm/PageIntro";
import { getCrmRepository } from "@/lib/crm";
import { formatContactName, formatDateTime } from "@/lib/crm/format";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const repository = getCrmRepository();
  const [contact, opportunities] = await Promise.all([
    repository.getContact(id),
    repository.getOpportunities(),
  ]);

  if (!contact) {
    notFound();
  }

  const contactOpportunities = opportunities
    .filter((opportunity) => opportunity.contactId === contact.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const activityCount = contactOpportunities.reduce(
    (sum, opportunity) => sum + opportunity.activities.length,
    0,
  );

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Ficha de contacto"
        title={formatContactName(contact.firstName, contact.lastName)}
        description="Pessoa e historico comercial. Contacto e oportunidade permanecem conceitos separados."
      />

      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <p className="text-xs font-bold uppercase text-stone-500">Telefone</p>
            <a href={`tel:${contact.phone}`} className="mt-1 block font-bold text-stone-950 hover:text-primary">
              {contact.phone}
            </a>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-stone-500">Email</p>
            <p className="mt-1 font-bold text-stone-950">{contact.email ?? "Sem email"}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-stone-500">Oportunidades</p>
            <p className="mt-1 font-bold text-stone-950">{contactOpportunities.length}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-stone-500">Atividades</p>
            <p className="mt-1 font-bold text-stone-950">{activityCount}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-stone-950">Oportunidades associadas</h2>
          <span className="rounded-full bg-stone-100 px-3 py-1 text-sm font-bold text-stone-700">
            Contacto ≠ oportunidade
          </span>
        </div>
        {contactOpportunities.length > 0 ? (
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {contactOpportunities.map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} showSource />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-border p-5 text-sm text-stone-600">
            Este contacto ainda nao tem oportunidades.
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-stone-950">Historico comercial resumido</h2>
        {contactOpportunities.length > 0 ? (
          <ol className="mt-4 space-y-3">
            {contactOpportunities.map((opportunity) => (
              <li key={opportunity.id} className="rounded-xl bg-stone-50 p-3 text-sm text-stone-700">
                <Link
                  href={`/crm/oportunidades/${opportunity.id}`}
                  className="font-bold text-stone-950 hover:text-primary"
                >
                  {opportunity.type === "buyer" ? "Compra" : "Venda"} em{" "}
                  {opportunity.location ?? "local por confirmar"}
                </Link>
                <span className="block text-stone-500">
                  Criada em {formatDateTime(opportunity.createdAt)} ·{" "}
                  {opportunity.activities.length} atividades
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 text-sm text-stone-600">Sem historico comercial.</p>
        )}
      </section>
    </div>
  );
}
