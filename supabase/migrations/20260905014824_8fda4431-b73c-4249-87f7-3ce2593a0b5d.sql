-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text NOT NULL UNIQUE,
  full_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Perfis visiveis para usuarios logados" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Cada um cria seu proprio perfil" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Cada um edita seu proprio perfil" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- JUSTIFICATIVAS
CREATE TABLE public.blend_justificativas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data date NOT NULL,
  turno text NOT NULL CHECK (turno IN ('1°', '2°')),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  autor_nome text NOT NULL DEFAULT '',
  texto text NOT NULL DEFAULT '',
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blend_justificativas TO authenticated;
GRANT ALL ON public.blend_justificativas TO service_role;
ALTER TABLE public.blend_justificativas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Justificativas visiveis para usuarios logados" ON public.blend_justificativas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios logados criam justificativas" ON public.blend_justificativas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuarios logados editam justificativas" ON public.blend_justificativas FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Usuarios logados excluem justificativas" ON public.blend_justificativas FOR DELETE TO authenticated USING (true);

CREATE INDEX blend_justificativas_ordem_idx ON public.blend_justificativas (data, turno, ordem);

CREATE TRIGGER update_blend_justificativas_updated_at BEFORE UPDATE ON public.blend_justificativas
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- IMAGENS
CREATE TABLE public.blend_justificativa_imagens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  justificativa_id uuid NOT NULL REFERENCES public.blend_justificativas(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  image_url text NOT NULL,
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blend_justificativa_imagens TO authenticated;
GRANT ALL ON public.blend_justificativa_imagens TO service_role;
ALTER TABLE public.blend_justificativa_imagens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Imagens visiveis para usuarios logados" ON public.blend_justificativa_imagens FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios logados criam imagens" ON public.blend_justificativa_imagens FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuarios logados editam imagens" ON public.blend_justificativa_imagens FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Usuarios logados excluem imagens" ON public.blend_justificativa_imagens FOR DELETE TO authenticated USING (true);

CREATE INDEX blend_imagens_justificativa_idx ON public.blend_justificativa_imagens (justificativa_id, ordem);