import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, ScanLine, Settings2, QrCode, ArrowUpRight } from "lucide-react";
import { AdminLayout } from "@/components/admin-layout";
import { PlateQr } from "@/components/plate-qr";
import { Button } from "@/components/ui/button";
import { platesQuery } from "@/lib/data";
import { publicPlateUrl } from "@/lib/qr";
import { useOrigin } from "@/lib/use-origin";

export const Route = createFileRoute("/_authenticated/placas/")({
  head: () => ({ meta: [{ title: "Placas — QR Manager" }] }),
  component: PlatesPage,
});

function PlatesPage() {
  const { data: plates, isLoading } = useQuery(platesQuery);
  const origin = useOrigin();
  const total = plates?.length ?? 0;
  const withDest = plates?.filter((p) => p.destination).length ?? 0;

  return (
    <AdminLayout
      title="Placas"
      description="Cada placa tem um QR permanente. Troque o destino quando quiser."
      actions={
        <>
          <Button asChild variant="glass">
            <Link to="/ler-qr">
              <ScanLine /> Ler QR
            </Link>
          </Button>
          <Button asChild variant="hero">
            <Link to="/placas/nova">
              <Plus /> Nova placa
            </Link>
          </Button>
        </>
      }
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Placas" value={total} />
        <Stat label="Com destino" value={withDest} tone="success" />
        <Stat label="Sem destino" value={total - withDest} tone="warning" />
      </div>

      {isLoading ? (
        <div className="glass h-40 animate-pulse rounded-2xl" />
      ) : !plates?.length ? (
        <div className="glass rounded-2xl p-10 text-center">
          <QrCode className="mx-auto size-10 text-brand" />
          <h2 className="mt-4 text-lg font-bold">Nenhuma placa ainda</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Crie sua primeira placa para gerar o QR Code e imprimir.
          </p>
          <Button asChild variant="hero" className="mt-5">
            <Link to="/placas/nova">
              <Plus /> Criar placa
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plates.map((plate) => (
            <article key={plate.id} className="glass flex flex-col rounded-2xl p-5">
              <div className="flex gap-4">
                <PlateQr value={origin ? publicPlateUrl(origin, plate.code) : ""} size={88} />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-base font-bold">{plate.name}</h2>
                  <div className="mt-1 font-mono text-xs text-muted-foreground">/q/{plate.code}</div>
                  <div className="mt-3">
                    <div className="eyebrow">Destino atual</div>
                    {plate.destination ? (
                      <a
                        href={plate.destination.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex max-w-full items-center gap-1 text-sm font-medium text-brand"
                      >
                        <span className="truncate">{plate.destination.name}</span>
                        <ArrowUpRight className="size-3.5 shrink-0" />
                      </a>
                    ) : (
                      <span className="mt-1 inline-block rounded-md bg-warning/15 px-2 py-0.5 text-xs font-semibold text-warning-foreground">
                        Sem destino
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <Button asChild variant="soft" size="sm">
                  <Link to="/placas/$code/configurar" params={{ code: plate.code }}>
                    <Settings2 /> Configurar
                  </Link>
                </Button>
                <Button asChild variant="muted" size="sm">
                  <Link to="/placas/$code/qr" params={{ code: plate.code }}>
                    <QrCode /> Ver QR
                  </Link>
                </Button>
                <Button asChild variant="muted" size="sm">
                  <Link to="/ler-qr">
                    <ScanLine /> Ler QR
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "success" | "warning";
}) {
  const color =
    tone === "success" ? "text-success" : tone === "warning" ? "text-warning-foreground" : "text-brand";
  return (
    <div className="glass rounded-2xl px-5 py-4">
      <div className="eyebrow">{label}</div>
      <div className={`mt-1 font-display text-3xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
