import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin-layout";
import { QrScanner } from "@/components/qr-scanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { extractPlateCode } from "@/lib/qr";

export const Route = createFileRoute("/_authenticated/ler-qr")({
  head: () => ({ meta: [{ title: "Ler QR — QR Manager" }] }),
  component: ScanPage,
});

function ScanPage() {
  const navigate = useNavigate();
  const [manual, setManual] = useState("");
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(true);

  async function handleCode(raw: string) {
    const code = extractPlateCode(raw);
    if (!code) {
      toast.error("Este QR não é de uma placa do QR Manager.");
      setScanning(false);
      setTimeout(() => setScanning(true), 1500);
      return;
    }
    setBusy(true);
    const { data } = await supabase.from("plates").select("code").eq("code", code).maybeSingle();
    setBusy(false);
    if (!data) {
      toast.error(`Placa ${code} não encontrada na sua conta.`);
      setScanning(false);
      setTimeout(() => setScanning(true), 1500);
      return;
    }
    toast.success(`Placa ${code} identificada.`);
    navigate({ to: "/placas/$code/configurar", params: { code } });
  }

  function handleManual(e: FormEvent) {
    e.preventDefault();
    handleCode(manual);
  }

  return (
    <AdminLayout
      title="Ler QR"
      description="Aponte a câmera para a placa. Você será levado à configuração dela, sem redirecionar."
    >
      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        <QrScanner active={scanning && !busy} onResult={handleCode} />
        <div className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <h2 className="text-base font-bold">Sem câmera?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Digite o código impresso abaixo do QR ou cole o link da placa.
            </p>
            <form onSubmit={handleManual} className="mt-4 flex gap-2">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="manual-code" className="sr-only">
                  Código
                </Label>
                <Input
                  id="manual-code"
                  placeholder="ABC123 ou https://…/q/ABC123"
                  value={manual}
                  onChange={(e) => setManual(e.target.value)}
                  className="font-mono uppercase"
                />
              </div>
              <Button type="submit" variant="hero" disabled={busy || !manual.trim()}>
                Abrir
              </Button>
            </form>
          </div>
          <div className="glass rounded-2xl p-5 text-sm text-muted-foreground">
            <div className="eyebrow mb-1">Como funciona</div>
            Quando você está logado, o QR abre a tela de configuração da placa. Quando um
            cliente escaneia, ele vai direto para o destino atual.
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
