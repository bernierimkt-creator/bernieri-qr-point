import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Plus, QrCode, Check, ArrowUpRight } from "lucide-react";
import { AdminLayout } from "@/components/admin-layout";
import { PlateQr } from "@/components/plate-qr";
import { DestinationForm, type DestinationValues } from "@/components/destination-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { destinationsQuery, plateByCodeQuery } from "@/lib/data";
import { publicPlateUrl } from "@/lib/qr";
import { useOrigin } from "@/lib/use-origin";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/placas/$code/configurar")({
  head: ({ params }) => ({ meta: [{ title: `Configurar ${params.code} — QR Manager` }] }),
  component: ConfigurePlatePage,
});

function ConfigurePlatePage() {
  const { code } = Route.useParams();
  const queryClient = useQueryClient();
  const origin = useOrigin();
  const { data: plate, isLoading } = useQuery(plateByCodeQuery(code));
  const { data: destinations } = useQuery(destinationsQuery);
  const [selected, setSelected] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (plate) setSelected(plate.destination_id);
  }, [plate]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["plates"] });
    queryClient.invalidateQueries({ queryKey: ["plate", code] });
    queryClient.invalidateQueries({ queryKey: ["destinations"] });
  };

  const save = useMutation({
    mutationFn: async (destinationId: string | null) => {
      if (!plate) throw new Error("Placa não carregada.");
      const { error } = await supabase
        .from("plates")
        .update({ destination_id: destinationId })
        .eq("id", plate.id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Destino atualizado. O mesmo QR já aponta para o novo destino.");
    },
    onError: (err) => toast.error(err.message),
  });

  const createAndAssign = useMutation({
    mutationFn: async (values: DestinationValues) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user || !plate) throw new Error("Sessão expirada.");
      const { data: dest, error } = await supabase
        .from("destinations")
        .insert({ ...values, user_id: auth.user.id })
        .select("id")
        .single();
      if (error) throw error;
      const { error: updErr } = await supabase
        .from("plates")
        .update({ destination_id: dest.id })
        .eq("id", plate.id);
      if (updErr) throw updErr;
      return dest.id;
    },
    onSuccess: (id) => {
      setSelected(id);
      setDialogOpen(false);
      invalidate();
      toast.success("Destino criado e associado à placa.");
    },
    onError: (err) => toast.error(err.message),
  });

  const dirty = plate ? selected !== plate.destination_id : false;

  return (
    <AdminLayout
      title={plate ? `Configurar: ${plate.name}` : "Configurar placa"}
      description="Escolha para onde este QR deve levar. Você pode trocar quando quiser."
      actions={
        <>
          <Button asChild variant="glass">
            <Link to="/placas">
              <ArrowLeft /> Voltar
            </Link>
          </Button>
          <Button asChild variant="muted">
            <Link to="/placas/$code/qr" params={{ code }}>
              <QrCode /> Ver QR
            </Link>
          </Button>
        </>
      }
    >
      {isLoading ? (
        <div className="glass h-80 animate-pulse rounded-2xl" />
      ) : !plate ? (
        <div className="glass max-w-md rounded-2xl p-8 text-center text-sm text-muted-foreground">
          Placa <span className="font-mono">{code}</span> não encontrada.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="glass-strong h-fit rounded-2xl p-5">
            <PlateQr value={origin ? publicPlateUrl(origin, code) : ""} size={200} />
            <div className="mt-4 font-mono text-xs text-muted-foreground">/q/{code}</div>
            <div className="mt-4 border-t border-border/70 pt-4">
              <div className="eyebrow">Destino atual</div>
              {plate.destination ? (
                <a
                  href={plate.destination.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 flex items-center gap-1 text-sm font-semibold text-brand"
                >
                  {plate.destination.name} <ArrowUpRight className="size-3.5" />
                </a>
              ) : (
                <div className="mt-1 text-sm font-medium text-warning-foreground">
                  Sem destino configurado
                </div>
              )}
            </div>
          </aside>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Escolher destino</h2>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="soft" size="sm">
                    <Plus /> Novo destino
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Novo destino</DialogTitle>
                    <DialogDescription>
                      Será criado e associado a esta placa imediatamente.
                    </DialogDescription>
                  </DialogHeader>
                  <DestinationForm
                    submitLabel="Criar e associar"
                    pending={createAndAssign.isPending}
                    onSubmit={(v) => createAndAssign.mutate(v)}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {!destinations?.length ? (
              <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">
                Você ainda não tem destinos. Crie o primeiro com o botão acima.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <DestOption
                  active={selected === null}
                  onClick={() => setSelected(null)}
                  name="Nenhum destino"
                  detail="Mostra a mensagem de placa sem destino"
                />
                {destinations.map((d) => (
                  <DestOption
                    key={d.id}
                    active={selected === d.id}
                    onClick={() => setSelected(d.id)}
                    name={d.name}
                    detail={d.url}
                    current={d.id === plate.destination_id}
                  />
                ))}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="hero"
                size="lg"
                disabled={!dirty || save.isPending}
                onClick={() => save.mutate(selected)}
              >
                <Check /> {save.isPending ? "Salvando…" : "Salvar destino"}
              </Button>
              {dirty && <span className="text-xs text-muted-foreground">Alterações não salvas</span>}
            </div>
          </section>
        </div>
      )}
    </AdminLayout>
  );
}

function DestOption({
  active,
  current,
  name,
  detail,
  onClick,
}: {
  active: boolean;
  current?: boolean;
  name: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "glass flex items-start gap-3 rounded-2xl p-4 text-left transition-all hover:border-brand/40",
        active && "border-brand ring-2 ring-brand/30",
      )}
    >
      <span
        className={cn(
          "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border",
          active ? "gradient-brand border-transparent text-brand-foreground" : "border-border",
        )}
      >
        {active && <Check className="size-3" />}
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <span className="truncate">{name}</span>
          {current && (
            <span className="rounded-md bg-success/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-success">
              atual
            </span>
          )}
        </span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">{detail}</span>
      </span>
    </button>
  );
}
