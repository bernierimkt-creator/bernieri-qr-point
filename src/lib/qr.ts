const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Gera um código curto, legível e sem caracteres ambíguos (ex.: 7KQ2MX). */
export function generatePlateCode(length = 6): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return out;
}

/** Monta a URL pública permanente da placa: <origem>/q/CODIGO. */
export function publicPlateUrl(origin: string, code: string): string {
  return `${origin.replace(/\/+$/, "")}/q/${code.toUpperCase()}`;
}

/** Extrai o código da placa de um texto lido do QR (URL completa ou código puro). */
export function extractPlateCode(text: string): string | null {
  const trimmed = text.trim();
  const match = trimmed.match(/\/q\/([A-Za-z0-9]+)/);
  if (match?.[1]) return match[1].toUpperCase();
  if (/^[A-Za-z0-9]{4,12}$/.test(trimmed)) return trimmed.toUpperCase();
  return null;
}
