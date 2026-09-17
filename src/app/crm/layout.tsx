import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { CrmSidebar } from "@/components/crm/CrmSidebar";
import { ManualOpportunityDialog } from "@/components/crm/ManualOpportunityDialog";
import { MobileCrmNav } from "@/components/crm/MobileCrmNav";
import { getSupabaseSessionProfile } from "@/lib/auth/server-auth";
import { getCrmRepository } from "@/lib/crm";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CrmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getSupabaseSessionProfile();

  if (!profile) {
    redirect("/login");
  }

  const repository = getCrmRepository();
  const [profiles, sources, contacts] = await Promise.all([
    repository.getProfiles(),
    repository.getLeadSources(),
    repository.getContacts(),
  ]);

  return (
    <div className="crm-shell min-h-dvh pb-24 text-stone-100 lg:pb-0 lg:pl-72">
      <CrmSidebar
        profile={{
          fullName: profile.fullName,
          role: profile.role,
        }}
      />
      <header className="sticky top-0 z-30 flex flex-col gap-3 border-b border-[rgba(229,199,157,0.18)] bg-[rgba(3,17,31,0.82)] px-5 py-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">CRM Mariana</p>
          <p className="mt-1 text-sm text-stone-400">Comando comercial privado</p>
        </div>
        <ManualOpportunityDialog
          profiles={profiles}
          sources={sources}
          contacts={contacts}
          currentProfileId={profile.id}
        />
      </header>
      <main className="mx-auto max-w-7xl px-5 py-6 lg:px-8">{children}</main>
      <MobileCrmNav />
    </div>
  );
}
