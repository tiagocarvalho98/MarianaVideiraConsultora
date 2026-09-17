import { Filter } from "lucide-react";
import { OpportunityCard } from "@/components/crm/OpportunityCard";
import { OpportunityControls } from "@/components/crm/OpportunityControls";
import { PageIntro } from "@/components/crm/PageIntro";
import { buyerPipelineStages, sellerPipelineStages } from "@/data/pipeline-stages";
import { leadTemperatures } from "@/data/temperatures";
import { getCrmRepository } from "@/lib/crm";
import type {
  LeadTemperature,
  OpportunityType,
  OpportunityWithRelations,
  PipelineStage,
  Profile,
} from "@/types/crm";

type PipelineSearchParams = {
  type?: string;
  assignedTo?: string;
  temperature?: string;
  sourceId?: string;
};

function PipelineBoard({
  title,
  opportunities,
  stages,
  profiles,
}: {
  title: string;
  opportunities: OpportunityWithRelations[];
  stages: PipelineStage[];
  profiles: Profile[];
}) {
  return (
    <section className="crm-surface rounded-3xl p-5">
      <div className="relative flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-stone-50">{title}</h2>
        <span className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-sm font-bold text-accent">
          {opportunities.length}
        </span>
      </div>
      <div className="relative mt-4 grid gap-4 xl:grid-cols-3">
        {stages.map((stage) => {
          const stageOpportunities = opportunities.filter(
            (opportunity) => opportunity.stage === stage.id,
          );

          return (
            <div key={stage.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
              <div className="flex items-center justify-between gap-3 px-1 py-2">
                <h3 className="text-sm font-bold text-stone-200">{stage.label}</h3>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-bold text-stone-300">
                  {stageOpportunities.length}
                </span>
              </div>
              <div className="mt-2 space-y-3">
                {stageOpportunities.map((opportunity) => (
                  <div key={opportunity.id} className="space-y-2">
                    <OpportunityCard opportunity={opportunity} compact />
                    <OpportunityControls opportunity={opportunity} profiles={profiles} compact />
                  </div>
                ))}
                {stageOpportunities.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-accent/25 bg-white/5 p-4 text-sm text-stone-400">
                    Sem oportunidades nesta etapa.
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<PipelineSearchParams>;
}) {
  const params = await searchParams;
  const repository = getCrmRepository();
  const [profiles, sources] = await Promise.all([
    repository.getProfiles(),
    repository.getLeadSources(),
  ]);
  const selectedType: OpportunityType =
    params.type === "seller" || params.type === "buyer" ? params.type : "buyer";
  const selectedTemperature =
    params.temperature === "fria" ||
    params.temperature === "morna" ||
    params.temperature === "quente"
      ? (params.temperature as LeadTemperature)
      : undefined;
  const opportunities = await repository.getOpportunities({
    type: selectedType,
    assignedTo: params.assignedTo || undefined,
    temperature: selectedTemperature,
    sourceId: params.sourceId || undefined,
  });
  const stages = selectedType === "buyer" ? buyerPipelineStages : sellerPipelineStages;

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Oportunidades"
        title="Pipeline"
        description="Leads e oportunidades por etapa. A mudanca de estado funciona por dropdown e cria uma activity auditavel."
      />

      <form className="crm-card rounded-3xl p-4">
        <div className="flex items-center gap-2 text-sm font-bold text-stone-200">
          <Filter className="h-4 w-4" aria-hidden="true" />
          Filtros
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <label className="grid gap-1 text-sm font-semibold text-stone-300">
            Vista
            <select name="type" defaultValue={selectedType} className="min-h-11 rounded-xl border border-accent/20 bg-[#061a2b] px-3 text-stone-100">
              <option value="buyer">Compradores</option>
              <option value="seller">Vendedores</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm font-semibold text-stone-300">
            Responsavel
            <select name="assignedTo" defaultValue={params.assignedTo ?? ""} className="min-h-11 rounded-xl border border-accent/20 bg-[#061a2b] px-3 text-stone-100">
              <option value="">Todos</option>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.fullName}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-semibold text-stone-300">
            Temperatura
            <select name="temperature" defaultValue={params.temperature ?? ""} className="min-h-11 rounded-xl border border-accent/20 bg-[#061a2b] px-3 text-stone-100">
              <option value="">Todas</option>
              {leadTemperatures.map((temperature) => (
                <option key={temperature.id} value={temperature.id}>
                  {temperature.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-semibold text-stone-300">
            Origem
            <select name="sourceId" defaultValue={params.sourceId ?? ""} className="min-h-11 rounded-xl border border-accent/20 bg-[#061a2b] px-3 text-stone-100">
              <option value="">Todas</option>
              {sources.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button className="mt-3 min-h-11 rounded-xl bg-accent px-4 text-sm font-bold text-primary-foreground transition hover:bg-primary">
          Aplicar filtros
        </button>
      </form>

      <PipelineBoard
        title={selectedType === "buyer" ? "Compradores" : "Vendedores"}
        opportunities={opportunities}
        stages={stages}
        profiles={profiles}
      />
    </div>
  );
}
