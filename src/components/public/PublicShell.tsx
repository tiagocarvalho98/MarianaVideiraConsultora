import Link from "next/link";
import { brand, publicNavItems } from "@/config/brand";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-background/92 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <Link href="/" className="leading-tight">
          <span className="block font-display text-xl font-semibold text-stone-950">
            {brand.fullName}
          </span>
          <span className="text-xs font-bold uppercase text-stone-500">{brand.role}</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-stone-700 md:flex" aria-label="Navegacao principal">
          {publicNavItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-primary">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/contacto"
            className="hidden min-h-11 items-center rounded-full border border-border px-4 text-sm font-bold text-stone-800 transition hover:border-primary hover:text-primary sm:inline-flex"
          >
            Falar com a Mariana
          </Link>
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-sm font-bold text-white transition hover:bg-stone-900"
          >
            CRM
          </Link>
        </div>
      </div>
      <nav className="grid grid-cols-5 border-t border-stone-200 bg-white text-center text-xs font-bold text-stone-700 md:hidden" aria-label="Navegacao principal movel">
        {publicNavItems.map((item) => (
          <Link key={item.href} href={item.href} className="min-h-11 px-1 py-3 hover:bg-stone-50">
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-stone-200 bg-stone-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
        <div>
          <p className="font-display text-2xl font-semibold">{brand.fullName}</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-stone-300">{brand.tagline}</p>
          <p className="mt-4 text-xs uppercase tracking-[0.16em] text-stone-500">
            {brand.company} · {brand.network}
          </p>
        </div>
        <div>
          <p className="text-sm font-bold uppercase text-stone-400">Navegacao</p>
          <div className="mt-3 grid gap-2 text-sm text-stone-300">
            {publicNavItems.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-bold uppercase text-stone-400">Contacto</p>
          <div className="mt-3 grid gap-2 text-sm text-stone-300">
            <span>{brand.phone}</span>
            <span>{brand.email}</span>
            <span>{brand.instagram}</span>
            <Link href="/privacidade" className="mt-2 hover:text-white">Privacidade</Link>
            <Link href="/cookies" className="hover:text-white">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicHeader />
      {children}
      <PublicFooter />
    </>
  );
}
