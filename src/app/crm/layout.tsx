import { redirect } from "next/navigation";
import { CrmSidebar } from "@/components/crm/CrmSidebar";
import { MobileCrmNav } from "@/components/crm/MobileCrmNav";
import { getSupabaseSessionProfile } from "@/lib/auth/server-auth";

export default async function CrmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getSupabaseSessionProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="min-h-dvh bg-background pb-24 lg:pb-0 lg:pl-72">
      <CrmSidebar
        profile={{
          fullName: profile.fullName,
          role: profile.role,
        }}
      />
      <header className="border-b border-border bg-background/90 px-5 py-4 backdrop-blur lg:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
          CRM Mariana
        </p>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-6 lg:px-8">{children}</main>
      <MobileCrmNav />
    </div>
  );
}
