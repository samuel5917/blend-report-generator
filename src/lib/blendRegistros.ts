import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Persistência compartilhada das justificativas do Blend + imagens do controle T2.
 * Fonte única usada tanto pela tela operacional quanto pelo Relatório de Blend.
 */

const BUCKET = "blend-t2";

export type TurnoRegistro = "1°" | "2°";

export interface ImagemT2 {
  /** Presente quando a imagem já está salva no banco. */
  id?: string;
  storage_path?: string;
  /** URL exibível (assinada ou objectURL do arquivo pendente). */
  url: string;
  /** Arquivo aguardando envio. */
  file?: File;
  ordem: number;
}

export interface Justificativa {
  id: string;
  data: string; // YYYY-MM-DD
  turno: TurnoRegistro;
  user_id: string | null;
  autor_nome: string;
  texto: string;
  ordem: number;
  created_at: string;
  updated_at: string;
  imagens: ImagemT2[];
}

export const turnoLabel = (t: string) => (t === "2°" ? "2º Turno" : "1º Turno");
export const turnoCurto = (t: string) => (t === "2°" ? "2º TURNO" : "1º TURNO");

export function formatarDataBR(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

export const ordemCronologica = (a: Justificativa, b: Justificativa) =>
  a.data.localeCompare(b.data) || a.turno.localeCompare(b.turno) || a.ordem - b.ordem;

export const ordemManual = (a: Justificativa, b: Justificativa) =>
  a.ordem - b.ordem || ordemCronologica(a, b);

async function assinar(path: string): Promise<string> {
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 8);
  return data?.signedUrl ?? "";
}

export interface FiltroJustificativas {
  de?: string;
  ate?: string;
  turno?: TurnoRegistro | "";
  userId?: string | "";
}

export async function listarJustificativas(f: FiltroJustificativas = {}): Promise<Justificativa[]> {
  let q = supabase
    .from("blend_justificativas")
    .select(
      "id, data, turno, user_id, autor_nome, texto, ordem, created_at, updated_at, blend_justificativa_imagens(id, storage_path, image_url, ordem)",
    );
  if (f.de) q = q.gte("data", f.de);
  if (f.ate) q = q.lte("data", f.ate);
  if (f.turno) q = q.eq("turno", f.turno);
  if (f.userId) q = q.eq("user_id", f.userId);

  const { data, error } = await q;
  if (error) throw error;

  const registros: Justificativa[] = await Promise.all(
    (data ?? []).map(async (r) => {
      const brutas = [...(r.blend_justificativa_imagens ?? [])].sort((a, b) => a.ordem - b.ordem);
      const imagens: ImagemT2[] = await Promise.all(
        brutas.map(async (i) => ({
          id: i.id,
          storage_path: i.storage_path,
          url: await assinar(i.storage_path),
          ordem: i.ordem,
        })),
      );
      return {
        id: r.id,
        data: r.data,
        turno: (r.turno === "2°" ? "2°" : "1°") as TurnoRegistro,
        user_id: r.user_id,
        autor_nome: r.autor_nome,
        texto: r.texto,
        ordem: r.ordem,
        created_at: r.created_at,
        updated_at: r.updated_at,
        imagens,
      };
    }),
  );

  return registros.sort(ordemManual);
}

async function enviarImagem(justificativaId: string, file: File, ordem: number) {
  const ext = (file.name.split(".").pop() || "png").toLowerCase().slice(0, 5);
  const path = `${justificativaId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type || "image/png" });
  if (error) throw error;
  const { error: e2 } = await supabase.from("blend_justificativa_imagens").insert({
    justificativa_id: justificativaId,
    storage_path: path,
    image_url: path,
    ordem,
  });
  if (e2) throw e2;
}

export interface EntradaJustificativa {
  id?: string;
  data: string;
  turno: TurnoRegistro;
  texto: string;
  userId: string | null;
  autorNome: string;
  imagens: ImagemT2[];
  /** Ids de imagens já salvas que devem ser removidas. */
  imagensRemovidas?: Array<{ id: string; storage_path: string }>;
}

export async function salvarJustificativa(e: EntradaJustificativa): Promise<string> {
  if (!e.data) throw new Error("Informe a data do turno.");
  if (!e.texto.trim()) throw new Error("A justificativa está vazia.");

  let id = e.id;
  if (id) {
    const { error } = await supabase
      .from("blend_justificativas")
      .update({
        data: e.data,
        turno: e.turno,
        texto: e.texto,
        autor_nome: e.autorNome,
        user_id: e.userId,
      })
      .eq("id", id);
    if (error) throw error;
  } else {
    const { data: max } = await supabase
      .from("blend_justificativas")
      .select("ordem")
      .order("ordem", { ascending: false })
      .limit(1);
    const proxima = (max?.[0]?.ordem ?? 0) + 1;
    const { data, error } = await supabase
      .from("blend_justificativas")
      .insert({
        data: e.data,
        turno: e.turno,
        texto: e.texto,
        autor_nome: e.autorNome,
        user_id: e.userId,
        ordem: proxima,
      })
      .select("id")
      .single();
    if (error) throw error;
    id = data.id;
  }

  for (const rem of e.imagensRemovidas ?? []) {
    await supabase.storage.from(BUCKET).remove([rem.storage_path]);
    await supabase.from("blend_justificativa_imagens").delete().eq("id", rem.id);
  }

  let ordem = 0;
  for (const img of e.imagens) {
    if (img.file) {
      await enviarImagem(id!, img.file, ordem);
    } else if (img.id) {
      await supabase.from("blend_justificativa_imagens").update({ ordem }).eq("id", img.id);
    }
    ordem += 1;
  }

  return id!;
}

export async function excluirJustificativa(j: Justificativa): Promise<void> {
  const paths = j.imagens.map((i) => i.storage_path).filter((p): p is string => !!p);
  if (paths.length > 0) await supabase.storage.from(BUCKET).remove(paths);
  const { error } = await supabase.from("blend_justificativas").delete().eq("id", j.id);
  if (error) throw error;
}

/** Grava a ordem informada (índice da lista) em todos os registros. */
export async function gravarOrdem(lista: Justificativa[]): Promise<void> {
  await Promise.all(
    lista.map((j, i) =>
      supabase.from("blend_justificativas").update({ ordem: i + 1 }).eq("id", j.id),
    ),
  );
}

export function useJustificativas(filtro: FiltroJustificativas) {
  const [registros, setRegistros] = useState<Justificativa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const chave = JSON.stringify(filtro);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    try {
      setRegistros(await listarJustificativas(JSON.parse(chave) as FiltroJustificativas));
      setErro(null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao carregar as justificativas.");
    } finally {
      setCarregando(false);
    }
  }, [chave]);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  return { registros, setRegistros, carregando, erro, recarregar };
}
