import type { JustificativaState } from "@/config/blend";

export interface Draft {
  id: string;
  criadoEm: string;
  atualizadoEm: string;
  texto: string;
  state: JustificativaState;
}

const KEY = "blend-justificativas-v1";

export function listarDrafts(): Draft[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Draft[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistir(drafts: Draft[]) {
  window.localStorage.setItem(KEY, JSON.stringify(drafts.slice(0, 100)));
}

export function salvarDraft(state: JustificativaState, texto: string, id?: string): Draft[] {
  const drafts = listarDrafts();
  const agora = new Date().toISOString();
  const existente = id ? drafts.find((d) => d.id === id) : undefined;
  if (existente) {
    existente.state = state;
    existente.texto = texto;
    existente.atualizadoEm = agora;
  } else {
    drafts.unshift({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      criadoEm: agora,
      atualizadoEm: agora,
      texto,
      state,
    });
  }
  const ordenados = [...drafts].sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm));
  persistir(ordenados);
  return ordenados;
}

export function excluirDraft(id: string): Draft[] {
  const drafts = listarDrafts().filter((d) => d.id !== id);
  persistir(drafts);
  return drafts;
}

export function duplicarDraft(id: string): Draft[] {
  const drafts = listarDrafts();
  const alvo = drafts.find((d) => d.id === id);
  if (!alvo) return drafts;
  const agora = new Date().toISOString();
  drafts.unshift({
    ...alvo,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    criadoEm: agora,
    atualizadoEm: agora,
  });
  persistir(drafts);
  return drafts;
}
