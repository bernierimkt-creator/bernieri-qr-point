import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Printer, Download, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin-layout";
import { PlateQr } from "@/components/plate-qr";
import { Button } from "@/components/ui/button";
import { plateByCodeQuery } from "@/lib/data";
import { publicPlateUrl } from "@/lib/qr";
import { useOrigin } from "@/lib/use-origin";

export const Route = createFileRoute("/_authenticated/placas/$code/qr")({
  head: ({ params }) => ({ meta: [{ title: `QR ${params.code} — QR Manager` }] }),
  component: PlateQrPage,
});

function PlateQrPage() {
  const { code } = Route.useParams();
  const { data: plate, isLoading } = useQuery(plateByCodeQuery(code));
  const origin = useOrigin();
  const url = origin ? publicPlateUrl(origin, code) : "";

  function download() {
    const svg = document.getElementById("plate-qr-svg");
    if (!svg) return;
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `qr-${code}.svg`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    toast.success("Link copiado.");
  }

  return (
    <AdminLayout
      title={plate?.name ?? "QR da placa"}
      description="Imprima e fixe na placa física. Este QR nunca muda."
      actions={
        <>
          <Button asChild variant="glass" className="no-print">
            <Link to="/placas">
              <ArrowLeft /> Voltar
            </Link>
          </Button>
          <Button asChild variant="soft" className="no-print">
            <Link to="/placas/$code/configurar" params={{ code }}>
              <Settings2 /> Configurar destino
            </Link>
          </Button>
        </>
      }
    >
      {isLoading ? (
        <div className="glass h-80 max-w-md animate-pulse rounded-2xl" />
      ) : !plate ? (
        <div className="glass max-w-md rounded-2xl p-8 text-center text-sm text-muted-foreground">
          Placa não encontrada.
        </div>
      ) : (
        <div className="grid max-w-3xl gap-6 md:grid-cols-[auto_1fr]">
          <div className="print-area glass-strong flex flex-col items-center rounded-3xl p-8">
            <PlateQr id="plate-qr-svg" value={url} size={240} />
            <div className="mt-4 font-display text-lg font-bold">{plate.name}</div>
            <div className="font-mono text-sm text-muted-foreground">{code}</div>
          </div>
          <div className="no-print space-y-4">
            <div className="glass rounded-2xl p-5">
              <div className="eyebrow">Endereço público</div>
              <button
                onClick={copyLink}
                className="mt-1 break-all text-left font-mono text-sm text-brand hover:underline"
              >
                {url || "…"}
              </button>
              <p className="mt-2 text-xs text-muted-foreground">
                Ao escanear sem estar logado, o cliente vai direto para o destino atual.
              </p>
            </div>
            <div className="glass rounded-2xl p-5">
              <div className="eyebrow">Destino atual</div>
              <div className="mt-1 text-sm font-medium">
                {plate.destination ? plate.destination.name : "Sem destino configurado"}
              </div>
              {plate.destination && (
                <div className="truncate text-xs text-muted-foreground">{plate.destination.url}</div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="hero" onClick={() => window.print()}>
                <Printer /> Imprimir
              </Button>
              <Button variant="muted" onClick={download}>
                <Download /> Baixar SVG
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
