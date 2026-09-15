import { PageIntro } from "@/components/crm/PageIntro";
import { getCrmRepository } from "@/lib/crm";

export default async function ConfiguracoesPage() {
  const dataset = await getCrmRepository().getDataset();

  return (
    <div>
      <PageIntro
        eyebrow="Sistema"
        title="Configuracoes"
        description="Estado tecnico da aplicacao ligada ao Supabase real."
      />
      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-stone-950">Modo de dados</h2>
        <p className="mt-2 text-stone-600">
          A UI esta ligada ao SupabaseRepository. Auth, RLS e intake publico
          seller/buyer estao ativos no projeto Supabase real.
        </p>
        <dl className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl bg-stone-50 p-4">
            <dt className="text-sm text-stone-500">Perfis</dt>
            <dd className="mt-2 text-2xl font-bold">{dataset.profiles.length}</dd>
          </div>
          <div className="rounded-xl bg-stone-50 p-4">
            <dt className="text-sm text-stone-500">Contactos</dt>
            <dd className="mt-2 text-2xl font-bold">{dataset.contacts.length}</dd>
          </div>
          <div className="rounded-xl bg-stone-50 p-4">
            <dt className="text-sm text-stone-500">Oportunidades</dt>
            <dd className="mt-2 text-2xl font-bold">
              {dataset.opportunities.length}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
