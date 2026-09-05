import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fonte única dos Atalhos do CCO (cadastro compartilhado no backend).
 * O Dashboard consome apenas os ativos; o cadastro consome todos.
 */

export interface AtalhoCCO {
  id: string;
  nome: string;
  url: string;
  descricao: string;
  /** Favicon detectado automaticamente a partir da URL. */
  icone_url: string;
  /** Ícone enviado pelo usuário (data URL .ico/.png/.svg) — tem prioridade. */
  icone_personalizado: string;
  ativo: boolean;
  ordem: number;
}

const ordenar = (a: AtalhoCCO, b: AtalhoCCO) => a.ordem - b.ordem || a.nome.localeCompare(b.nome);

/** Normaliza a URL informada, garantindo protocolo. */
export function normalizarUrl(bruta: string): string {
  const v = bruta.trim();
  if (!v) return "";
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

/** Ícone a exibir: enviado pelo usuário → descoberto automaticamente → vazio. */
export function iconePreferido(a: Pick<AtalhoCCO, "icone_personalizado" | "icone_url">): string {
  return a.icone_personalizado || a.icone_url || "";
}

/** Iniciais do nome, usadas como último recurso no card. */
export function iniciaisDoNome(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0]!.slice(0, 2).toUpperCase();
  return `${partes[0]![0]}${partes[1]![0]}`.toUpperCase();
}

const LIMITE_ICONE = 300 * 1024;
const TIPOS_ICONE = [".ico", ".png", ".svg"];

/** Converte o arquivo de ícone enviado em data URL persistível. */
export async function lerIconePersonalizado(file: File): Promise<string> {
  const nome = file.name.toLowerCase();
  if (!TIPOS_ICONE.some((ext) => nome.endsWith(ext))) {
    throw new Error("Formato não aceito. Envie um arquivo .ico, .png ou .svg.");
  }
  if (file.size > LIMITE_ICONE) {
    throw new Error("Ícone muito grande. Envie um arquivo de até 300 KB.");
  }
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo do ícone."));
    reader.readAsDataURL(file);
  });
}

const COLUNAS = "id, nome, url, descricao, icone_url, icone_personalizado, ativo, ordem";

export async function listarAtalhos(): Promise<AtalhoCCO[]> {
  const { data, error } = await supabase
    .from("atalhos_cco")
    .select(COLUNAS)
    .order("ordem", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    nome: r.nome,
    url: r.url,
    descricao: r.descricao,
    icone_url: r.icone_url,
    icone_personalizado: r.icone_personalizado,
    ativo: r.ativo,
    ordem: r.ordem,
  }));
}

export async function criarAtalho(
  dados: Omit<AtalhoCCO, "id" | "ativo"> & { ativo?: boolean },
): Promise<void> {
  const url = normalizarUrl(dados.url);
  const { error } = await supabase.from("atalhos_cco").insert({
    nome: dados.nome.trim(),
    url,
    descricao: dados.descricao.trim(),
    icone_url: dados.icone_url,
    icone_personalizado: dados.icone_personalizado,
    ativo: dados.ativo ?? true,
    ordem: dados.ordem,
  });
  if (error) throw error;
}

export async function atualizarAtalho(
  id: string,
  patch: Partial<Omit<AtalhoCCO, "id">>,
): Promise<void> {
  const dados = { ...patch };
  if (typeof dados.url === "string") {
    dados.url = normalizarUrl(dados.url);
  }
  const { error } = await supabase.from("atalhos_cco").update(dados).eq("id", id);
  if (error) throw error;
}

export async function excluirAtalho(id: string): Promise<void> {
  const { error } = await supabase.from("atalhos_cco").delete().eq("id", id);
  if (error) throw error;
}

/** Reescreve a ordem conforme a sequência recebida (drag and drop). */
export async function reordenarAtalhos(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id, i) => atualizarAtalho(id, { ordem: (i + 1) * 10 })));
}

export function useAtalhos() {
  const [atalhos, setAtalhos] = useState<AtalhoCCO[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    try {
      const lista = await listarAtalhos();
      setAtalhos([...lista].sort(ordenar));
      setErro(null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao carregar os atalhos.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  return {
    atalhos,
    /** Somente atalhos ativos, na ordem cadastrada. */
    ativos: atalhos.filter((a) => a.ativo),
    carregando,
    erro,
    recarregar,
    setAtalhos,
  };
}
