CREATE TABLE public.atalhos_cco (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  url text NOT NULL,
  descricao text NOT NULL DEFAULT '',
  icone_url text NOT NULL DEFAULT '',
  icone_personalizado text NOT NULL DEFAULT '',
  ativo boolean NOT NULL DEFAULT true,
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.atalhos_cco TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.atalhos_cco TO authenticated;
GRANT ALL ON public.atalhos_cco TO service_role;

ALTER TABLE public.atalhos_cco ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cadastro de atalhos do CCO e compartilhado"
ON public.atalhos_cco FOR ALL TO anon, authenticated
USING (true) WITH CHECK (true);

CREATE TRIGGER update_atalhos_cco_updated_at
BEFORE UPDATE ON public.atalhos_cco
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();