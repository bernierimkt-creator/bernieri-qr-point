import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Link2, ArrowUpRight } from "lucide-react";
import { AdminLayout } from "@/components/admin-layout";
import { DestinationForm, type DestinationValues } from "@/components/destination-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { destinationsQuery, platesQuery, type Destination } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/destinos/")({
  head: () => ({ meta: [{ title: "Destinos — QR Manager" }] }),
  component: DestinationsPage,
});

function DestinationsPage() {
  const queryClient = useQueryClient();
  const { data: destinations, isLoading } = useQuery(destinationsQuery);
  const { data: plates } = useQuery(platesQuery);
  const [editing, setEditing] = useState<Destination | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["destinations"] });
    queryClient.invalidateQueries({ queryKey: ["plates"] });
  };

  const update = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: DestinationValues }) => {
      const { error } = await supabase.from("destinations").update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      setEditing(null);
      toast.success("Destino atualizado.");
    },
    onError: (err) => toast.error(err.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("destinations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Destino excluído. Placas que o usavam ficaram sem destino.");
    },
    onError: (err) => toast.error(err.message),
  });

  const usage = (id: string) => plates?.filter((p) => p.destination_id === id).length ?? 0;

  return (
    <AdminLayout
      title="Destinos"
      description="Links que suas placas podem apontar. Um destino pode servir várias placas."
      actions={
        <Button asChild variant="hero">
          <Link to="/destinos/novo">
            <Plus /> Novo destino
          </Link>
        </Button>
      }
    >
      {isLoading ? (
        <div className="glass h-40 animate-pulse rounded-2xl" />
      ) : !destinations?.length ? (
        <div className="glass rounded-2xl p-10 text-center">
          <Link2 className="mx-auto size-10 text-brand" />
          <h2 className="mt-4 text-lg font-bold">Nenhum destino ainda</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cadastre um nome e uma URL para começar a associar às placas.
          </p>
          <Button asChild variant="hero" className="mt-5">
            <Link to="/destinos/novo">
              <Plus /> Criar destino
            </Link>
          </Button>
        </div>
      ) : (
        <div className="glass overflow-hidden rounded-2xl">
          <table className="w-full text-sm">
            <thead className="bg-ink/[0.03] text-left">
              <tr className="eyebrow">
                <th className="px-5 py-3 font-semibold">Nome</th>
                <th className="hidden px-5 py-3 font-semibold md:table-cell">URL</th>
                <th className="px-5 py-3 font-semibold">Placas</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {destinations.map((d) => (
                <tr key={d.id} className="border-t border-border/60">
                  <td className="px-5 py-3 font-semibold">{d.name}</td>
                  <td className="hidden max-w-xs px-5 py-3 md:table-cell">
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex max-w-full items-center gap-1 text-brand"
                    >
                      <span className="truncate">{d.url}</span>
                      <ArrowUpRight className="size-3.5 shrink-0" />
                    </a>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{usage(d.id)}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Editar"
                        onClick={() => setEditing(d)}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Excluir"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          if (confirm(`Excluir o destino "${d.name}"?`)) remove.mutate(d.id);
                        }}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar destino</DialogTitle>
            <DialogDescription>
              Todas as placas associadas passam a usar a nova URL.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <DestinationForm
              key={editing.id}
              initial={editing}
              submitLabel="Salvar alterações"
              pending={update.isPending}
              onSubmit={(values) => update.mutate({ id: editing.id, values })}
            />
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
