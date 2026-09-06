import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fonte única de verdade das Mensagens T2 (compartilhada entre todos os usuários).
 * Tanto a área operacional quanto o cadastro consomem estas funções — nunca listas fixas.
 */

export interface MensagemT2 {
  id: string;
  nome: string;
  mensagem: string;
  categoria: string;
  ativo: boolean;
  ordem: number;
}

const ordenar = (a: MensagemT2, b: MensagemT2) =>
  a.ordem - b.ordem || a.nome.localeCompare(b.nome);

export async function listarMensagens(): Promise<MensagemT2[]> {
  const { data, error } = await supabase
    .from("mensagens_t2")
    .select("id, nome, mensagem, categoria, ativo, ordem")
    .order("ordem", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    nome: r.nome,
    mensagem: r.mensagem,
    categoria: r.categoria ?? "",
    ativo: r.ativo,
    ordem: r.ordem,
  }));
}

export async function criarMensagem(
  nome: string,
  mensagem: string,
  ordem: number,
  categoria = "",
): Promise<void> {
  const { error } = await supabase
    .from("mensagens_t2")
    .insert({ nome: nome.trim(), mensagem: mensagem.trim(), categoria: categoria.trim(), ordem });
  if (error) throw error;
}

export async function atualizarMensagem(
  id: string,
  patch: Partial<Omit<MensagemT2, "id">>,
): Promise<void> {
  const { error } = await supabase.from("mensagens_t2").update(patch).eq("id", id);
  if (error) throw error;
}

export async function excluirMensagem(id: string): Promise<void> {
  const { error } = await supabase.from("mensagens_t2").delete().eq("id", id);
  if (error) throw error;
}

/** Reescreve a ordem conforme a sequência recebida (usado pelo drag and drop). */
export async function reordenarMensagens(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id, i) => atualizarMensagem(id, { ordem: (i + 1) * 10 })));
}

export function useMensagens() {
  const [mensagens, setMensagens] = useState<MensagemT2[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    try {
      const lista = await listarMensagens();
      setMensagens([...lista].sort(ordenar));
      setErro(null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao carregar as mensagens.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  return {
    mensagens,
    /** Somente mensagens ativas, na ordem do cadastro. */
    ativas: mensagens.filter((m) => m.ativo),
    carregando,
    erro,
    recarregar,
    setMensagens,
  };
}
