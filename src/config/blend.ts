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

export interface MovimentacaoState {
  houve: boolean;
  origem: string;
  destino: string;
  quantidade: string;
}

export interface JustificativaState {
  data: string;
  turno: Turno;
  bancos: BancoState[];
  observacoes: string[];
  paradas: ParadaState[];
  om: MovimentacaoState;
  reprocesso: MovimentacaoState;
  estoque: MovimentacaoState;
  remanejo: MovimentacaoState;
}

export const emptyMovimentacao = (): MovimentacaoState => ({
  houve: false,
  origem: "",
  destino: "",
  quantidade: "",
});

const emptyPlanta = (): PlantaState => ({
  situacao: "",
  motivo: "",
  motivoOutro: "",
  texto: "",
});

export const novoBanco = (nome: string): BancoState => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  nome,
  planta01: emptyPlanta(),
  planta02: emptyPlanta(),
  observacao: "",
});

export const novaParada = (): ParadaState => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
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
  om: emptyMovimentacao(),
  reprocesso: emptyMovimentacao(),
  estoque: emptyMovimentacao(),
  remanejo: emptyMovimentacao(),
});

/** Normaliza estados antigos (3° turno, situações/campos removidos). */
export function normalizarEstado(raw: Partial<JustificativaState>): JustificativaState {
  const base = estadoInicial();
  const s = { ...base, ...raw };
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
  const mov = (m?: Partial<MovimentacaoState>): MovimentacaoState => ({
    houve: !!m?.houve,
    origem: m?.origem ?? "",
    destino: m?.destino ?? "",
    quantidade: m?.quantidade ?? "",
  });
  return {
    ...s,
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
      local: PARADA_LOCAIS.includes(p.local) ? p.local : "",
    })),
    om: mov(s.om),
    reprocesso: mov(s.reprocesso),
    estoque: mov(s.estoque),
    remanejo: mov(s.remanejo),
  };
}
