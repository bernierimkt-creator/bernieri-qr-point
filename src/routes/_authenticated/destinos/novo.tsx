import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { AdminLayout } from "@/components/admin-layout";
import { DestinationForm, type DestinationValues } from "@/components/destination-form";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/destinos/novo")({
  head: () => ({ meta: [{ title: "Novo destino — QR Manager" }] }),
  component: NewDestinationPage,
});

function NewDestinationPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: async (values: DestinationValues) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sessão expirada.");
      const { error } = await supabase
        .from("destinations")
        .insert({ ...values, user_id: auth.user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destinations"] });
      toast.success("Destino criado.");
      navigate({ to: "/destinos" });
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <AdminLayout
      title="Novo destino"
      description="Um nome amigável e a URL para onde o cliente será levado."
      actions={
        <Button asChild variant="glass">
          <Link to="/destinos">
            <ArrowLeft /> Voltar
          </Link>
        </Button>
      }
    >
      <div className="glass max-w-lg rounded-2xl p-6">
        <DestinationForm
          submitLabel="Criar destino"
          pending={create.isPending}
          onSubmit={(v) => create.mutate(v)}
        />
      </div>
    </AdminLayout>
  );
}
