import Link from "next/link";
import { notFound } from "next/navigation";
import { CrmNotesBoard } from "@/components/crm/CrmNotesBoard";
import { MetricTile } from "@/components/crm/MetricTile";
import { PageIntro } from "@/components/crm/PageIntro";
import { dashboardMetricCards } from "@/data/dashboard-metrics";
import { getSupabaseSessionProfile } from "@/lib/auth/server-auth";
import { getCrmRepository } from "@/lib/crm";
import { cn } from "@/lib/utils";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const selectedTab = tab === "notas" ? "notas" : "metricas";
  const repository = getCrmRepository();
  const [metrics, currentProfile, profiles, notes, teams, teamMembers] = await Promise.all([
    repository.getDashboardMetrics(),
    getSupabaseSessionProfile(),
    repository.getProfiles(),
    repository.getCrmNotes(),
    repository.getNoteTeams(),
    repository.getNoteTeamMembers(),
  ]);

  if (!currentProfile) {
    notFound();
  }

  const maxSourceCount = Math.max(...metrics.bySource.map((item) => item.count), 1);

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Metricas"
        title="Dashboard"
        description="Leitura curta de captacao e operacao. Acoes e follow-up continuam a viver primeiro na pagina Hoje."
      />

      <div className="flex w-fit rounded-2xl border border-accent/20 bg-white/[0.035] p-1">
        {[
          { id: "metricas", label: "Metricas", href: "/crm/dashboard" },
          { id: "notas", label: "Notas", href: "/crm/dashboard?tab=notas" },
        ].map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-bold transition",
              selectedTab === item.id
                ? "bg-accent text-primary-foreground"
                : "text-stone-300 hover:text-accent",
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {selectedTab === "notas" ? (
        <CrmNotesBoard
          notes={notes}
          teams={teams}
          teamMembers={teamMembers}
          profiles={profiles}
          currentProfileId={currentProfile.id}
        />
      ) : (
        <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardMetricCards.map((card) => (
          <MetricTile
            key={card.key}
            label={card.label}
            value={metrics[card.key]}
            hint={card.hint}
          />
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="crm-surface rounded-3xl p-5">
          <h2 className="relative text-lg font-bold text-stone-50">Origem das leads</h2>
          <div className="mt-5 space-y-4">
            {metrics.bySource.map((item) => (
              <div key={item.source} className="relative">
                <div className="flex justify-between gap-4 text-sm">
                  <span className="font-semibold text-stone-300">{item.source}</span>
                  <strong className="text-stone-100">{item.count}</strong>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${Math.max(8, (item.count / maxSourceCount) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="crm-surface crm-geometric-detail rounded-3xl p-5">
          <h2 className="relative text-lg font-bold text-stone-50">Leitura operacional</h2>
          <div className="relative mt-4 space-y-3 text-sm leading-6 text-stone-300">
            <p>
              <strong>{metrics.overdueFollowUps}</strong> follow-ups vencidos precisam de
              atencao antes de novas analises.
            </p>
            <p>
              <strong>{metrics.qualified}</strong> oportunidades estao qualificadas e devem
              manter proxima acao visivel.
            </p>
            <p>
              <strong>{metrics.lost}</strong> oportunidades perdidas ja alimentam motivos
              estruturados para aprendizagem futura.
            </p>
          </div>
        </section>
      </div>
        </>
      )}
    </div>
  );
}
