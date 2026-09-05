/**
 * Configuração central do gerador de Justificativa do Blend.
 * Para adicionar bancos, motivos, locais ou frases, edite apenas este arquivo.
 */

export const TURNOS = ["1°", "2°"] as const;
export type Turno = (typeof TURNOS)[number];

/* ------------------------------- Plantas 01/02 -------------------------------- */

export const PLANTA_SITUACOES = [
  "Atendido",
  "Não Atendido",
  "Atendido Parcialmente",
  "Outros",
] as const;
export type PlantaSituacao = (typeof PLANTA_SITUACOES)[number];

/** Motivos para "Não Atendido" e "Atendido Parcialmente". */
export const PLANTA_MOTIVOS = [
  "Pulmão cheio",
  "Falta de material",
  "Definição da equipe de qualidade",
  "Outros",
];

export const OBS_TURNO_SUGESTOES = [
  "Blend atendido conforme Diretriz.",
  "Blend reiniciado de maneira proporcional.",
  "Blend foi reformulado.",
  "Blend foi realizado mais de uma vez.",
  "Houve redistribuição de viagens.",
  "Houve baixa disponibilidade de CBs.",
  "Houve baixa disponibilidade de motoristas.",
  "Houve necessidade de geração de material.",
  "Houve material com elevada umidade.",
];

/* ------------------------------ Paradas operacionais -------------------------- */

export const PARADA_MOTIVOS = [
  "Pulmão cheio",
  "Aguardando gerar material",
  "Falta de material",
  "Falta de rompedor",
  "Equipamento em manutenção",
  "Planta sem operação",
  "Planta parada",
  "Acerto da praça de carregamento",
  "Carreta interditando acesso",
  "Bloqueio de acesso",
  "Baixa visibilidade",
  "Neblina",
  "Falta de energia",
  "Sobrecarga de equipamento",
  "Troca de turno / DDS",
  "Aguardando orientação",
  "Necessidade interna",
  "Manutenção preventiva",
  "Outros",
];

/* ----------------------------------- Tipos ----------------------------------- */

export interface PlantaState {
  situacao: PlantaSituacao | "";
  motivo: string;
  motivoOutro: string;
  texto: string;
}

export interface BancoState {
  id: string;
  nome: string;
  planta01: PlantaState;
  planta02: PlantaState;
  observacao: string;
}

export interface ParadaState {
  id: string;
  local: string;
  inicio: string;
  fim: string;
  motivo: string;
  motivoOutro: string;
  observacao: string;
}

export const MOVIMENTACAO_TIPOS = ["OM", "Reprocesso", "Estoque", "Remanejo"] as const;
export type MovimentacaoTipo = (typeof MOVIMENTACAO_TIPOS)[number];

/** Cada movimentação é um registro independente — vários por tipo são permitidos. */
export interface MovimentacaoItem {
  id: string;
  tipo: MovimentacaoTipo;
  origem: string;
  destino: string;
  material: string;
  quantidade: string;
}

/** Formato antigo (um único registro por tipo) — mantido só para migração. */
interface MovimentacaoLegado {
  houve?: boolean;
  origem?: string;
  destino?: string;
  quantidade?: string;
}

export interface JustificativaState {
  data: string;
  turno: Turno;
  bancos: BancoState[];
  observacoes: string[];
  paradas: ParadaState[];
  movimentacoes: MovimentacaoItem[];
}

const novoId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const emptyPlanta = (): PlantaState => ({
  situacao: "",
  motivo: "",
  motivoOutro: "",
  texto: "",
});

export const novaMovimentacao = (tipo: MovimentacaoTipo = "OM"): MovimentacaoItem => ({
  id: novoId(),
  tipo,
  origem: "",
  destino: "",
  material: "",
  quantidade: "",
});

export const novoBanco = (nome: string): BancoState => ({
  id: novoId(),
  nome,
  planta01: emptyPlanta(),
  planta02: emptyPlanta(),
  observacao: "",
});

export const novaParada = (): ParadaState => ({
  id: novoId(),
  local: "",
  inicio: "",
  fim: "",
  motivo: "",
  motivoOutro: "",
  observacao: "",
});

export const estadoInicial = (): JustificativaState => ({
  data: new Date().toISOString().slice(0, 10),
  turno: "1°",
  bancos: [],
  observacoes: [],
  paradas: [],
  movimentacoes: [],
});

/** Normaliza estados antigos sem perder bancos, paradas ou movimentações. */
export function normalizarEstado(raw: Partial<JustificativaState>): JustificativaState {
  const base = estadoInicial();
  const s = { ...base, ...raw } as Partial<JustificativaState> &
    Record<string, unknown> &
    JustificativaState;
  const turno: Turno = TURNOS.includes(s.turno as Turno) ? (s.turno as Turno) : "1°";
  const planta = (p?: Partial<PlantaState>): PlantaState => {
    const situacao =
      p?.situacao && PLANTA_SITUACOES.includes(p.situacao as PlantaSituacao)
        ? (p.situacao as PlantaSituacao)
        : "";
    return {
      situacao,
      motivo: PLANTA_MOTIVOS.includes(p?.motivo ?? "") ? p!.motivo! : "",
      motivoOutro: p?.motivoOutro ?? "",
      texto: p?.texto ?? "",
    };
  };

  // Migra o formato antigo (um registro fixo por tipo) para a lista de registros.
  const migradas: MovimentacaoItem[] = [];
  for (const tipo of MOVIMENTACAO_TIPOS) {
    const chave = tipo === "Estoque" ? "estoque" : tipo.toLowerCase();
    const legado = (s as Record<string, unknown>)[chave] as MovimentacaoLegado | undefined;
    if (legado && legado.houve) {
      migradas.push({
        id: novoId(),
        tipo,
        origem: legado.origem ?? "",
        destino: legado.destino ?? "",
        material: "",
        quantidade: legado.quantidade ?? "",
      });
    }
  }

  const movimentacoes: MovimentacaoItem[] = Array.isArray(s.movimentacoes)
    ? s.movimentacoes
        .filter((m) => MOVIMENTACAO_TIPOS.includes(m?.tipo as MovimentacaoTipo))
        .map((m) => ({
          id: m.id ?? novoId(),
          tipo: m.tipo,
          origem: m.origem ?? "",
          destino: m.destino ?? "",
          material: m.material ?? "",
          quantidade: m.quantidade ?? "",
        }))
    : [];

  return {
    data: s.data,
    turno,
    bancos: (s.bancos ?? []).map((b) => ({
      id: b.id,
      nome: b.nome,
      planta01: planta(b.planta01),
      planta02: planta(b.planta02),
      observacao: b.observacao ?? "",
    })),
    observacoes: s.observacoes ?? [],
    paradas: (s.paradas ?? []).map((p) => ({
      ...p,
      local: p.local ?? "",
    })),
    movimentacoes: movimentacoes.length > 0 ? movimentacoes : migradas,
  };
}

