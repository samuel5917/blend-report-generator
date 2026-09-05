CREATE TABLE public.mensagens_t2 (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mensagens_t2 TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mensagens_t2 TO authenticated;
GRANT ALL ON public.mensagens_t2 TO service_role;

ALTER TABLE public.mensagens_t2 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Biblioteca de mensagens T2 e compartilhada"
ON public.mensagens_t2 FOR ALL
TO anon, authenticated
USING (true) WITH CHECK (true);

CREATE TRIGGER update_mensagens_t2_updated_at
BEFORE UPDATE ON public.mensagens_t2
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();