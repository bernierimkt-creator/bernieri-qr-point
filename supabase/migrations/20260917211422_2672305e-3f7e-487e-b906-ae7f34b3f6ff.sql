CREATE TABLE public.destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.destinations TO authenticated;
GRANT ALL ON public.destinations TO service_role;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage destinations" ON public.destinations
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.plates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  destination_id uuid REFERENCES public.destinations(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plates TO authenticated;
GRANT ALL ON public.plates TO service_role;
ALTER TABLE public.plates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage plates" ON public.plates
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX plates_destination_id_idx ON public.plates(destination_id);

CREATE OR REPLACE FUNCTION public.resolve_plate(_code text)
RETURNS TABLE (plate_name text, destination_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.name, d.url
  FROM public.plates p
  LEFT JOIN public.destinations d ON d.id = p.destination_id
  WHERE p.code = _code
  LIMIT 1
$$;
GRANT EXECUTE ON FUNCTION public.resolve_plate(text) TO anon, authenticated, service_role;