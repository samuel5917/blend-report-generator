import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Autenticação simples por usuário + senha.
 * O Supabase Auth exige e-mail, então o "usuário" é convertido internamente
 * em um endereço técnico estável — o operador nunca digita e-mail.
 */

const DOMINIO = "mineshift.local";

export interface Perfil {
  id: string;
  username: string;
  full_name: string;
}

const normalizarUsuario = (u: string) =>
  u
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "");

export const emailDoUsuario = (usuario: string) => `${normalizarUsuario(usuario)}@${DOMINIO}`;

export async function cadastrar(usuario: string, nomeCompleto: string, senha: string) {
  const username = normalizarUsuario(usuario);
  if (!username) throw new Error("Informe um usuário válido (letras e números).");
  if (nomeCompleto.trim().length < 3) throw new Error("Informe o nome completo.");
  if (senha.length < 6) throw new Error("A senha precisa ter ao menos 6 caracteres.");

  const { error } = await supabase.auth.signUp({
    email: emailDoUsuario(username),
    password: senha,
    options: {
      data: { username, full_name: nomeCompleto.trim() },
      emailRedirectTo: `${window.location.origin}/`,
    },
  });
  if (error) {
    if (/already registered/i.test(error.message)) throw new Error("Este usuário já existe.");
    throw error;
  }
}

export async function entrar(usuario: string, senha: string) {
  const { error } = await supabase.auth.signInWithPassword({
    email: emailDoUsuario(usuario),
    password: senha,
  });
  if (error) {
    if (/invalid login credentials/i.test(error.message))
      throw new Error("Usuário ou senha incorretos.");
    throw error;
  }
}

export async function sair() {
  await supabase.auth.signOut();
}

export async function carregarPerfil(userId: string): Promise<Perfil | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, full_name")
    .eq("id", userId)
    .maybeSingle();
  if (error) return null;
  return data ?? null;
}

export async function listarPerfis(): Promise<Perfil[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, full_name")
    .order("full_name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export function useAuth() {
  const [userId, setUserId] = useState<string | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [carregando, setCarregando] = useState(true);

  const sincronizar = useCallback(async (id: string | null) => {
    setUserId(id);
    setPerfil(id ? await carregarPerfil(id) : null);
    setCarregando(false);
  }, []);

  useEffect(() => {
    let ativo = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (ativo) void sincronizar(data.session?.user.id ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") return;
      void sincronizar(session?.user.id ?? null);
    });
    return () => {
      ativo = false;
      sub.subscription.unsubscribe();
    };
  }, [sincronizar]);

  return { userId, perfil, carregando, autenticado: !!userId };
}
