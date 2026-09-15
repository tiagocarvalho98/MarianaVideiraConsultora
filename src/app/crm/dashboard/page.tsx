import { MetricTile } from "@/components/crm/MetricTile";
import { PageIntro } from "@/components/crm/PageIntro";
import { dashboardMetricCards } from "@/data/dashboard-metrics";
import { getCrmRepository } from "@/lib/crm";

export default async function DashboardPage() {
  const metrics = await getCrmRepository().getDashboardMetrics();
  const maxSourceCount = Math.max(...metrics.bySource.map((item) => item.count), 1);

  return (
    <div>
      <PageIntro
        eyebrow="Metricas"
        title="Dashboard"
        description="Leitura curta de captacao e operacao. Acoes e follow-up continuam a viver primeiro na pagina Hoje."
      />
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
        <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-stone-950">Origem das leads</h2>
          <div className="mt-5 space-y-4">
            {metrics.bySource.map((item) => (
              <div key={item.source}>
                <div className="flex justify-between gap-4 text-sm">
                  <span className="font-semibold text-stone-700">{item.source}</span>
                  <strong>{item.count}</strong>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.max(8, (item.count / maxSourceCount) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-stone-950">Leitura operacional</h2>
          <div className="mt-4 space-y-3 text-sm text-stone-700">
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
    </div>
  );
}
