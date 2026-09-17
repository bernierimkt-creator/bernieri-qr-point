import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/admin-layout";

export const Route = createFileRoute("/q/$code")({
  ssr: false,
  head: ({ params }) => ({
    meta: [
      { title: `Placa ${params.code} — QR Manager` },
      { name: "description", content: "Redirecionando para o destino desta placa." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: `Placa ${params.code} — QR Manager` },
      { property: "og:description", content: "Redirecionando para o destino desta placa." },
    ],
  }),
  component: PublicPlate,
});

type State =
  | { status: "loading" }
  | { status: "redirecting"; url: string }
  | { status: "no-destination"; name: string }
  | { status: "not-found" };

function PublicPlate() {
  const { code } = Route.useParams();
  const navigate = useNavigate();
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const upper = code.toUpperCase();
      // Administrador logado: abre a configuração em vez de redirecionar.
      const { data: session } = await supabase.auth.getSession();
      if (session.session) {
        navigate({ to: "/placas/$code/configurar", params: { code: upper }, replace: true });
        return;
      }
      const { data, error } = await supabase.rpc("resolve_plate", { _code: upper });
      if (cancelled) return;
      const row = data?.[0];
      if (error || !row) return setState({ status: "not-found" });
      if (row.destination_url) {
        setState({ status: "redirecting", url: row.destination_url });
        window.location.replace(row.destination_url);
      } else {
        setState({ status: "no-destination", name: row.plate_name });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code, navigate]);

  return (
    <div className="ambient-bg flex min-h-screen items-center justify-center px-4">
      <div className="glass-strong w-full max-w-sm rounded-2xl p-7 text-center">
        <div className="flex justify-center">
          <Logo compact />
        </div>
        {state.status === "loading" && (
          <p className="mt-5 text-sm text-muted-foreground">Localizando placa…</p>
        )}
        {state.status === "redirecting" && (
          <p className="mt-5 text-sm text-muted-foreground">
            Redirecionando…{" "}
            <a href={state.url} className="font-medium text-brand underline">
              Clique aqui se não abrir
            </a>
          </p>
        )}
        {state.status === "no-destination" && (
          <>
            <h1 className="mt-5 text-lg font-bold">{state.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Esta placa ainda não possui um destino configurado.
            </p>
          </>
        )}
        {state.status === "not-found" && (
          <>
            <h1 className="mt-5 text-lg font-bold">Placa não encontrada</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              O código <span className="font-mono">{code}</span> não corresponde a nenhuma placa.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
