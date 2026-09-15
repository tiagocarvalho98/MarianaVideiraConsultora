"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { crmNavItems } from "./crm-nav";
import { cn } from "@/lib/utils";

export function MobileCrmNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 px-2 py-2 shadow-soft backdrop-blur lg:hidden"
      aria-label="Navegacao movel CRM"
    >
      <div className="grid grid-cols-5 gap-1">
        {crmNavItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[11px] font-semibold transition",
                active ? "bg-primary text-white" : "text-stone-600 hover:bg-stone-100",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
