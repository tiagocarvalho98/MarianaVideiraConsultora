import Link from "next/link";
import { Menu } from "lucide-react";
import { brand, publicNavItems } from "@/config/brand";

function LogoMark() {
  return (
    <span className="grid grid-cols-[auto_1fr] items-center gap-3 leading-none">
      <span className="flex h-12 w-12 items-center justify-center border border-primary/55 font-display text-xl font-medium tracking-[0.08em] text-primary">
        MV
      </span>
      <span>
        <span className="block font-display text-2xl font-medium tracking-[0.04em] text-foreground">
          Mariana Videira
        </span>
        <span className="mt-1 block text-[0.62rem] font-bold uppercase tracking-[0.34em] text-foreground/58">
          Consultora Imobiliaria
        </span>
      </span>
    </span>
  );
}

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-primary/15 bg-background/92 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-5 lg:px-8">
        <Link href="/" aria-label="Pagina inicial Mariana Videira">
          <LogoMark />
        </Link>

        <nav
          className="hidden items-center gap-9 text-[0.68rem] font-bold uppercase tracking-[0.28em] text-foreground/70 lg:flex"
          aria-label="Navegacao principal"
        >
          {publicNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition duration-200 hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/contacto"
          className="hidden min-h-11 items-center border border-primary/50 px-5 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-primary transition duration-200 hover:bg-primary hover:text-primary-foreground sm:inline-flex"
        >
          Falar comigo
        </Link>

        <details className="group relative lg:hidden">
          <summary className="flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center border border-primary/45 text-primary transition hover:bg-primary hover:text-primary-foreground [&::-webkit-details-marker]:hidden">
            <Menu className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Abrir menu</span>
          </summary>
          <nav
            className="absolute right-0 top-14 grid w-[min(82vw,22rem)] gap-1 border border-primary/20 bg-background p-4 shadow-2xl shadow-black/30"
            aria-label="Navegacao principal movel"
          >
            {publicNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="min-h-11 px-3 py-3 text-sm font-bold uppercase tracking-[0.22em] text-foreground/78 transition hover:bg-surface hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/contacto"
              className="mt-2 min-h-11 border border-primary/45 px-3 py-3 text-sm font-bold uppercase tracking-[0.22em] text-primary transition hover:bg-primary hover:text-primary-foreground"
            >
              Falar comigo
            </Link>
          </nav>
        </details>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-primary/18 bg-[#020f1c] text-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-[1.15fr_1fr] lg:px-8">
        <div>
          <LogoMark />
          <p className="mt-6 max-w-md text-sm leading-7 text-foreground/62">
            Acompanhamento imobiliario em Montijo e Alcochete com criterio,
            proximidade e cuidado.
          </p>
          <p className="mt-7 text-[0.65rem] font-bold uppercase tracking-[0.34em] text-primary/70">
            Montijo / Alcochete
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.28em] text-primary">
              Navegacao
            </p>
            <div className="mt-4 grid gap-3 text-sm text-foreground/68">
              {publicNavItems.map((item) => (
                <Link key={item.href} href={item.href} className="hover:text-primary">
                  {item.label}
                </Link>
              ))}
              <Link href="/privacidade" className="hover:text-primary">
                Privacidade
              </Link>
              <Link href="/cookies" className="hover:text-primary">
                Cookies
              </Link>
            </div>
          </div>

          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.28em] text-primary">
              Rede
            </p>
            <div className="mt-4 grid gap-3 text-sm text-foreground/68">
              <span>{brand.network}</span>
              <span>{brand.company}</span>
              <Link href="/login" className="text-foreground/42 hover:text-primary">
                CRM
              </Link>
            </div>
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
