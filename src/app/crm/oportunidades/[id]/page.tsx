import { notFound } from "next/navigation";
import { ActivityForms } from "@/components/crm/ActivityForms";
import { ActivityTimeline } from "@/components/crm/ActivityTimeline";
import { StatusBadge, TemperatureBadge, TypeBadge } from "@/components/crm/Badges";
import { LostOpportunityDialog } from "@/components/crm/LostOpportunityDialog";
import { NextActionPanel } from "@/components/crm/NextActionPanel";
import { OpportunityControls } from "@/components/crm/OpportunityControls";
import { PageIntro } from "@/components/crm/PageIntro";
import { getCrmRepository } from "@/lib/crm";
import {
  formatContactName,
  formatDateTime,
  formatStage,
  formatStatus,
} from "@/lib/crm/format";

export default async function OpportunityDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  const { created } = await searchParams;
  const repository = getCrmRepository();
  const [opportunity, profiles] = await Promise.all([
    repository.getOpportunity(id),
    repository.getProfiles(),
  ]);

  if (!opportunity) {
    notFound();
  }

  const name = formatContactName(
    opportunity.contact.firstName,
    opportunity.contact.lastName,
  );

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Ficha de oportunidade"
        title={name}
        description="Contexto comercial, proxima acao e historico auditavel desta oportunidade."
      />

      {created === "1" ? (
        <div className="rounded-2xl border border-emerald-300/30 bg-emerald-300/10 p-4 text-sm font-bold text-emerald-100">
          Oportunidade criada.
        </div>
      ) : null}

      <section className="crm-surface crm-geometric-detail rounded-3xl p-5">
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <TypeBadge type={opportunity.type} />
              <StatusBadge status={opportunity.status} />
              <TemperatureBadge temperature={opportunity.temperature} />
            </div>
            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="font-bold text-stone-500">Telefone</dt>
                <dd className="mt-1 text-stone-50">{opportunity.contact.phone}</dd>
              </div>
              <div>
                <dt className="font-bold text-stone-500">Email</dt>
                <dd className="mt-1 text-stone-50">
                  {opportunity.contact.email ?? "Sem email"}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-stone-500">Localizacao</dt>
                <dd className="mt-1 text-stone-50">
                  {opportunity.location ?? "Por confirmar"}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-stone-500">Origem</dt>
                <dd className="mt-1 text-stone-50">
                  {opportunity.source?.name ?? "Sem origem"}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-stone-500">Tipo de imovel</dt>
                <dd className="mt-1 text-stone-50">
                  {opportunity.propertyType ?? "Por confirmar"}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-stone-500">Tipologia</dt>
                <dd className="mt-1 text-stone-50">
                  {opportunity.typology ?? "Por confirmar"}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-stone-500">Stage</dt>
                <dd className="mt-1 text-stone-50">{formatStage(opportunity.stage)}</dd>
              </div>
              <div>
                <dt className="font-bold text-stone-500">Status</dt>
                <dd className="mt-1 text-stone-50">{formatStatus(opportunity.status)}</dd>
              </div>
              <div>
                <dt className="font-bold text-stone-500">Responsavel</dt>
                <dd className="mt-1 text-stone-50">
                  {opportunity.assignedProfile?.fullName ?? "Sem responsavel"}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-stone-500">Ultima atividade</dt>
                <dd className="mt-1 text-stone-50">
                  {formatDateTime(opportunity.lastActivityAt)}
                </dd>
              </div>
            </dl>
          </div>
          {opportunity.status !== "lost" ? (
            <LostOpportunityDialog opportunity={opportunity} />
          ) : null}
        </div>

        {opportunity.status === "lost" ? (
          <div className="relative mt-5 rounded-xl border border-[#7a1b22]/60 bg-[#7a1b22]/25 p-4 text-sm text-red-100">
            Perdida: {opportunity.lostReason ? formatStage(opportunity.lostReason) : "motivo por confirmar"}
            {opportunity.lostNotes ? ` · ${opportunity.lostNotes}` : ""}
          </div>
        ) : null}
      </section>

      <NextActionPanel opportunity={opportunity} profiles={profiles} />

      <section className="crm-card rounded-3xl p-5">
        <h2 className="text-lg font-bold text-stone-50">Gestao rapida</h2>
        <div className="mt-4">
          <OpportunityControls opportunity={opportunity} profiles={profiles} />
        </div>
      </section>

      <ActivityForms opportunity={opportunity} />
      <ActivityTimeline activities={opportunity.activities} profiles={profiles} />
    </div>
  );
}
