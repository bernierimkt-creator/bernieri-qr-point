import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Destination = Tables<"destinations">;
export type Plate = Tables<"plates"> & { destination: Destination | null };

export const authUserQuery = queryOptions({
  queryKey: ["auth-user"],
  queryFn: async () => (await supabase.auth.getUser()).data.user,
});

export const destinationsQuery = queryOptions({
  queryKey: ["destinations"],
  queryFn: async (): Promise<Destination[]> => {
    const { data, error } = await supabase.from("destinations").select("*").order("name");
    if (error) throw error;
    return data;
  },
});

export const platesQuery = queryOptions({
  queryKey: ["plates"],
  queryFn: async (): Promise<Plate[]> => {
    const { data, error } = await supabase
      .from("plates")
      .select("*, destination:destinations(*)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as Plate[];
  },
});

export const plateByCodeQuery = (code: string) =>
  queryOptions({
    queryKey: ["plates", "code", code],
    queryFn: async (): Promise<Plate | null> => {
      const { data, error } = await supabase
        .from("plates")
        .select("*, destination:destinations(*)")
        .eq("code", code)
        .maybeSingle();
      if (error) throw error;
      return data as Plate | null;
    },
  });

/** Normaliza uma URL digitada pelo usuário (adiciona https:// se faltar). */
export function normalizeUrl(input: string): string | null {
  let value = input.trim();
  if (!value) return null;
  if (!/^https?:\/\//i.test(value)) value = `https://${value}`;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}
