import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { generatePlateCode } from "@/lib/qr";

export const Route = createFileRoute("/_authenticated/placas/nova")({
  head: () => ({ meta: [{ title: "Nova placa — QR Manager" }] }),
  component: NewPlatePage,
});

function NewPlatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");

  const create = useMutation({
    mutationFn: async (plateName: string) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sessão expirada.");
      // Tenta alguns códigos até encontrar um livre (colisão é rara).
      for (let attempt = 0; attempt < 5; attempt++) {
        const code = generatePlateCode();
        const { data, error } = await supabase
          .from("plates")
          .insert({ name: plateName, code, user_id: auth.user.id })
          .select("code")
          .single();
        if (!error) return data.code;
        if (error.code !== "23505") throw error;
      }
      throw new Error("Não foi possível gerar um código único. Tente novamente.");
    },
    onSuccess: (code) => {
      queryClient.invalidateQueries({ queryKey: ["plates"] });
      toast.success("Placa criada! Agora imprima o QR Code.");
      navigate({ to: "/placas/$code/qr", params: { code } });
    },
    onError: (err) => toast.error(err.message),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Informe um nome para a placa.");
      return;
    }
    create.mutate(name.trim());
  }

  return (
    <AdminLayout
      title="Nova placa"
      description="O sistema gera um código único e permanente para esta placa."
      actions={
        <Button asChild variant="glass">
          <Link to="/placas">
            <ArrowLeft /> Voltar
          </Link>
        </Button>
      }
    >
      <form onSubmit={handleSubmit} className="glass max-w-lg space-y-5 rounded-2xl p-6">
        <div className="space-y-1.5">
          <Label htmlFor="plate-name">Nome da placa</Label>
          <Input
            id="plate-name"
            placeholder="Ex.: Mesa 4, Vitrine, Balcão…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            Só para você identificar. O cliente não vê este nome.
          </p>
        </div>
        <Button type="submit" variant="hero" size="lg" disabled={create.isPending}>
          {create.isPending ? "Gerando QR…" : "Criar placa e gerar QR"}
        </Button>
      </form>
    </AdminLayout>
  );
}
