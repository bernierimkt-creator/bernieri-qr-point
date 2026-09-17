import { useEffect, useState } from "react";

/** Origem atual (https://dominio) lida apenas no navegador, evitando divergência de SSR. */
export function useOrigin(): string {
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
  return origin;
}
