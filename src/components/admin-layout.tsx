import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LayoutGrid, Link2, ScanLine, LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { authUserQuery } from "@/lib/data";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/placas", label: "Placas", icon: LayoutGrid },
  { to: "/destinos", label: "Destinos", icon: Link2 },
  { to: "/ler-qr", label: "Ler QR", icon: ScanLine },
] as const;

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="gradient-brand shadow-brand grid size-9 place-items-center rounded-xl font-display text-lg font-bold text-brand-foreground">
        Q
      </div>
      {!compact && (
        <div>
          <div className="font-display text-[15px] leading-none font-bold tracking-tight">
            QR Manager
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">placas e destinos</div>
        </div>
      )}
    </div>
  );
}

function SessionCard() {
  const { data: user } = useQuery(authUserQuery);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const email = user?.email ?? "";
  const initials = email.slice(0, 2).toUpperCase() || "QR";

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="gradient-ink m-3 mt-auto rounded-xl p-4 text-ink-foreground">
      <div className="eyebrow text-ink-foreground/50">Sessão ativa</div>
      <div className="mt-2 flex items-center gap-2">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink-foreground/15 text-xs font-semibold">
          {initials}
        </span>
        <div className="min-w-0 leading-tight">
          <div className="truncate text-[13px] font-semibold">Administrador</div>
          <div className="truncate text-[11px] text-ink-foreground/50">{email}</div>
        </div>
      </div>
      <button
        onClick={signOut}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-ink-foreground/10 py-2 text-xs font-semibold transition-colors hover:bg-ink-foreground/20"
      >
        <LogOut className="size-3.5" /> Sair
      </button>
    </div>
  );
}

function NavLinks({ mobile = false }: { mobile?: boolean }) {
  return (
    <>
      {NAV.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          className={cn(
            "flex items-center gap-2 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-ink/5",
            mobile ? "px-3 py-2" : "gap-3 px-3 py-2.5",
          )}
          activeProps={{ className: "bg-brand/10 text-brand hover:bg-brand/10" }}
        >
          <Icon className="size-4" />
          {label}
        </Link>
      ))}
    </>
  );
}

export function AdminLayout({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="ambient-bg min-h-screen overflow-x-hidden">
      <div className="flex min-h-screen">
        <aside className="glass sticky top-0 hidden h-screen w-64 shrink-0 flex-col rounded-none border-y-0 border-l-0 lg:flex">
          <div className="px-6 py-6">
            <Logo />
          </div>
          <nav className="mt-2 space-y-1 px-3">
            <NavLinks />
          </nav>
          <SessionCard />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="glass flex items-center justify-between gap-3 rounded-none border-x-0 border-t-0 px-4 py-3 lg:hidden">
            <Logo compact />
            <nav className="flex items-center gap-1">
              <NavLinks mobile />
            </nav>
          </div>

          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 px-5 py-5 lg:px-8">
            <div>
              <h1 className="text-2xl font-bold">{title}</h1>
              {description && (
                <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
              )}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
          </header>

          <main className="animate-rise px-5 py-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
