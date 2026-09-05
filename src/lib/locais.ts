import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fonte única de verdade dos bancos e locais operacionais.
 * Todo seletor de banco/local do app consome estas funções — nunca listas fixas.
 */

export type LocalTipo = "banco" | "local";

export interface Local {
  id: string;
  nome: string;
  tipo: LocalTipo;
  ativo: boolean;
  ordem: number;
}

const ordenar = (a: Local, b: Local) => a.ordem - b.ordem || a.nome.localeCompare(b.nome);

export async function listarLocais(): Promise<Local[]> {
  const { data, error } = await supabase
    .from("locais")
    .select("id, nome, tipo, ativo, ordem")
    .order("ordem", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    nome: r.nome,
    tipo: (r.tipo === "local" ? "local" : "banco") as LocalTipo,
    ativo: r.ativo,
    ordem: r.ordem,
  }));
}

export async function criarLocal(nome: string, tipo: LocalTipo, ordem: number): Promise<void> {
  const { error } = await supabase.from("locais").insert({ nome: nome.trim(), tipo, ordem });
  if (error) throw error;
}

export async function atualizarLocal(id: string, patch: Partial<Omit<Local, "id">>): Promise<void> {
  const { error } = await supabase.from("locais").update(patch).eq("id", id);
  if (error) throw error;
}

export async function excluirLocal(id: string): Promise<void> {
  const { error } = await supabase.from("locais").delete().eq("id", id);
  if (error) throw error;
}

/** Troca a ordem entre dois itens. */
export async function trocarOrdem(a: Local, b: Local): Promise<void> {
  await atualizarLocal(a.id, { ordem: b.ordem });
  await atualizarLocal(b.id, { ordem: a.ordem });
}

export function useLocais() {
  const [locais, setLocais] = useState<Local[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    try {
      const lista = await listarLocais();
      setLocais([...lista].sort(ordenar));
      setErro(null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao carregar o cadastro.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  const ativos = locais.filter((l) => l.ativo);

  return {
    locais,
    /** Nomes ativos (bancos + locais operacionais), na ordem do cadastro. */
    nomesAtivos: ativos.map((l) => l.nome),
    /** Somente locais operacionais ativos (Planta/Pulmão). */
    nomesLocaisOperacionais: ativos.filter((l) => l.tipo === "local").map((l) => l.nome),
    carregando,
    erro,
    recarregar,
  };
}
