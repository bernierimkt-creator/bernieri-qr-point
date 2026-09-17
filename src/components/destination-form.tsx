import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normalizeUrl } from "@/lib/data";

export type DestinationValues = { name: string; url: string };

export function DestinationForm({
  initial,
  onSubmit,
  submitLabel = "Salvar destino",
  pending = false,
  secondary,
}: {
  initial?: Partial<DestinationValues>;
  onSubmit: (values: DestinationValues) => void;
  submitLabel?: string;
  pending?: boolean;
  secondary?: React.ReactNode;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const normalized = normalizeUrl(url);
    if (!name.trim()) return setError("Informe um nome para o destino.");
    if (!normalized) return setError("Informe uma URL válida (ex.: https://seusite.com).");
    setError(null);
    onSubmit({ name: name.trim(), url: normalized });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="dest-name">Nome</Label>
        <Input
          id="dest-name"
          placeholder="Ex.: Cardápio, Instagram, Promoção…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="dest-url">URL</Label>
        <Input
          id="dest-url"
          placeholder="https://…"
          inputMode="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Button type="submit" variant="hero" disabled={pending}>
          {pending ? "Salvando…" : submitLabel}
        </Button>
        {secondary}
      </div>
    </form>
  );
}
