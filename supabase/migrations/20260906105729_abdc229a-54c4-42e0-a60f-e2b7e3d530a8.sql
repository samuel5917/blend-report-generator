CREATE TABLE public.equipamentos_informes (
  user_id uuid NOT NULL PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  informe jsonb NOT NULL DEFAULT '{}'::jsonb,
  rascunho jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.equipamentos_informes TO authenticated;
GRANT ALL ON public.equipamentos_informes TO service_role;

ALTER TABLE public.equipamentos_informes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cada um le seu proprio informe" ON public.equipamentos_informes
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Cada um cria seu proprio informe" ON public.equipamentos_informes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Cada um edita seu proprio informe" ON public.equipamentos_informes
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Cada um exclui seu proprio informe" ON public.equipamentos_informes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_equipamentos_informes_updated_at
  BEFORE UPDATE ON public.equipamentos_informes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();