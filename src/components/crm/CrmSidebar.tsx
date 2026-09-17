import Link from "next/link";
import { crmNavItems } from "./crm-nav";
import { logoutAction } from "@/app/login/actions";
import type { Profile } from "@/types/crm";

type CrmSidebarProps = {
  profile: Pick<Profile, "fullName" | "role">;
};

export function CrmSidebar({ profile }: CrmSidebarProps) {
  return (
    <aside className="fixed left-0 top-0 hidden h-dvh w-72 flex-col border-r border-[rgba(229,199,157,0.18)] bg-[rgba(1,9,20,0.94)] text-white lg:flex">
      <div className="border-b border-white/10 p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center border border-accent/55 font-display text-lg text-accent">
            MV
          </span>
          <div>
            <p className="font-display text-2xl font-semibold">Mariana</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-400">
              CRM privado
            </p>
          </div>
        </div>
        <div className="mt-5 h-px bg-gradient-to-r from-transparent via-[#7a1b22] to-transparent" />
        <p className="mt-4 text-sm leading-6 text-stone-400">
          Aquisição, seguimento e conversão sem oportunidades esquecidas.
        </p>
      </div>
      <nav className="flex-1 space-y-1 p-4" aria-label="Navegacao CRM">
        {crmNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-stone-300 transition hover:bg-white/10 hover:text-white"
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-4">
        <div className="crm-geometric-detail rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-sm font-semibold">{profile.fullName}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-stone-400">
            {profile.role}
          </p>
        </div>
        <form action={logoutAction} className="mt-3">
          <button className="min-h-11 w-full rounded-xl text-left text-sm font-semibold text-stone-300 transition hover:bg-white/10 hover:px-3 hover:text-white">
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
