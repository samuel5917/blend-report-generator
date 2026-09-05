CREATE TABLE public.locais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL DEFAULT 'banco',
  ativo BOOLEAN NOT NULL DEFAULT true,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT locais_tipo_check CHECK (tipo IN ('banco','local'))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.locais TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.locais TO authenticated;
GRANT ALL ON public.locais TO service_role;

ALTER TABLE public.locais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cadastro de bancos e locais e compartilhado" ON public.locais
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_locais_updated_at BEFORE UPDATE ON public.locais
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.locais (nome, tipo, ordem) VALUES
  ('B-960','banco',10),
  ('B-970','banco',20),
  ('B-980','banco',30),
  ('B-990','banco',40),
  ('B-1000','banco',50),
  ('B-1010','banco',60),
  ('B-1020','banco',70),
  ('B-1030','banco',80),
  ('B-1040','banco',90),
  ('B-1050','banco',100),
  ('B-1060','banco',110),
  ('B-1070','banco',120),
  ('B-1080','banco',130),
  ('B-1090','banco',140),
  ('B-1100','banco',150),
  ('B-1110','banco',160),
  ('B-1120','banco',170),
  ('B-1130','banco',180),
  ('Planta-01','local',190),
  ('Planta-02','local',200),
  ('Pulmão-01','local',210),
  ('Pulmão-02','local',220);