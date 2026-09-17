import Link from "next/link";
import { notFound } from "next/navigation";
import { OpportunityCard } from "@/components/crm/OpportunityCard";
import { PageIntro } from "@/components/crm/PageIntro";
import { ManualOpportunityDialog } from "@/components/crm/ManualOpportunityDialog";
import { getSupabaseSessionProfile } from "@/lib/auth/server-auth";
import { getCrmRepository } from "@/lib/crm";
import { formatContactName, formatDateTime } from "@/lib/crm/format";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const repository = getCrmRepository();
  const [contact, opportunities, profiles, sources, currentProfile] = await Promise.all([
    repository.getContact(id),
    repository.getOpportunities(),
    repository.getProfiles(),
    repository.getLeadSources(),
    getSupabaseSessionProfile(),
  ]);

  if (!contact || !currentProfile) {
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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageIntro
          eyebrow="Ficha de contacto"
          title={formatContactName(contact.firstName, contact.lastName)}
          description="Pessoa e historico comercial. Contacto e oportunidade permanecem conceitos separados."
        />
        <ManualOpportunityDialog
          profiles={profiles}
          sources={sources}
          contacts={[]}
          currentProfileId={currentProfile.id}
          preselectedContact={contact}
          buttonLabel="Nova oportunidade"
        />
      </div>

      <section className="crm-card rounded-3xl p-5">
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">Telefone</p>
            <a href={`tel:${contact.phone}`} className="mt-1 block font-bold text-stone-50 hover:text-accent">
              {contact.phone}
            </a>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">Email</p>
            <p className="mt-1 font-bold text-stone-50">{contact.email ?? "Sem email"}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">Oportunidades</p>
            <p className="mt-1 font-bold text-accent">{contactOpportunities.length}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">Atividades</p>
            <p className="mt-1 font-bold text-accent">{activityCount}</p>
          </div>
        </div>
      </section>

      <section className="crm-surface rounded-3xl p-5">
        <div className="relative flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-stone-50">Oportunidades associadas</h2>
          <span className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-sm font-bold text-accent">
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
          <div className="relative mt-4 rounded-xl border border-dashed border-accent/25 p-5 text-sm text-stone-400">
            Este contacto ainda nao tem oportunidades.
          </div>
        )}
      </section>

      <section className="crm-surface crm-geometric-detail rounded-3xl p-5">
        <h2 className="relative text-lg font-bold text-stone-50">Historico comercial resumido</h2>
        {contactOpportunities.length > 0 ? (
          <ol className="mt-4 space-y-3">
            {contactOpportunities.map((opportunity) => (
              <li key={opportunity.id} className="relative rounded-xl border border-white/10 bg-white/[0.035] p-3 text-sm text-stone-300">
                <Link
                  href={`/crm/oportunidades/${opportunity.id}`}
                  className="font-bold text-stone-50 hover:text-accent"
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
          <p className="relative mt-3 text-sm text-stone-400">Sem historico comercial.</p>
        )}
      </section>
    </div>
  );
}
