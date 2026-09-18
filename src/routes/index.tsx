import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/admin-layout";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "QR Manager — placas com QR Code permanente" },
      {
        name: "description",
        content: "Painel privado para gerenciar placas físicas com QR Codes permanentes e destinos trocáveis.",
      },
      { property: "og:title", content: "QR Manager — placas com QR Code permanente" },
      {
        property: "og:description",
        content: "Painel privado para gerenciar placas físicas com QR Codes permanentes e destinos trocáveis.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      navigate({ to: data.session ? "/placas" : "/auth", replace: true });
    });
  }, [navigate]);

  return (
    <div className="ambient-bg flex min-h-screen items-center justify-center">
      <div className="animate-pulse">
        <Logo />
      </div>
    </div>
  );
}
