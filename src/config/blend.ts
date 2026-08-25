/**
 * Configuração central do gerador de Justificativa do Blend.
 * Para adicionar bancos, motivos, locais ou frases, edite apenas este arquivo.
 */

export const TURNOS = ["1°", "2°", "3°"] as const;
export type Turno = (typeof TURNOS)[number];

export const BANCOS_PADRAO = [
  "B-1060",
  "B-1060 MN",
  "B-1030",
  "B-1030 Final do Banco",
  "B-1030 Meio do Banco",
  "B-1030 334",
  "B-1030 353",
  "B-1120",
  "B-1070",
  "B-1020",
  "Pilha B-1020",
  "B-1020 SF",
  "Baia 01",
  "Baia 01 1110",
  "Baia 02",
  "Baia 02 1110",
  "Baia 03",
  "Pulmão 01",
];

/* ---------------------------------- Planta 01 --------------------------------- */

export const P1_SITUACOES = [
  "Atendido",
  "Não houve movimentação",
  "Atendido parcialmente",
  "Outra situação",
] as const;
export type P1Situacao = (typeof P1_SITUACOES)[number];

export const P1_MOTIVOS_SEM_MOV = [
  "Planta 01 não operou",
  "Planta parada",
  "Pulmão cheio",
  "Orientação operacional para manter o pulmão sem alimentação",
  "Montagem da nova estrutura",
  "Atividades de aterro",
  "Nova praça operacional em preparação",
  "Outro",
];

/** Frase gerada para cada motivo de "Não houve movimentação" na Planta 01. */
export const P1_FRASES_SEM_MOV: Record<string, string> = {
  "Planta 01 não operou":
    "Não houve movimentação para o pulmão da Planta 01 em razão da não operação da Planta 01.",
  "Planta parada": "Não houve movimentação para o pulmão da Planta 01 em virtude da planta parada.",
  "Pulmão cheio": "Não houve movimentação para o pulmão da Planta 01 em razão de pulmão cheio.",
  "Orientação operacional para manter o pulmão sem alimentação":
    "Não houve movimentação para o pulmão da Planta 01 conforme orientação operacional para manter o pulmão sem alimentação.",
  "Montagem da nova estrutura":
    "Não houve movimentação para o pulmão da Planta 01, pois a planta permanece parada para montagem da nova estrutura.",
  "Atividades de aterro":
    "Não houve movimentação para o pulmão da Planta 01 em razão das atividades de aterro.",
  "Nova praça operacional em preparação":
    "Não houve movimentação para o pulmão da Planta 01, com nova praça operacional em preparação.",
};

/* ---------------------------------- Planta 02 --------------------------------- */

export const P2_SITUACOES = [
  "Atendido",
  "Atendido parcialmente",
  "Não atendido",
  "Não houve movimentação",
  "Substituído por outro material",
  "Outra situação",
] as const;
export type P2Situacao = (typeof P2_SITUACOES)[number];

export const P2_COMPLEMENTOS_ATENDIDO = [
  "Conforme planejado no Blend proposto pela Qualidade",
  "Conforme a Diretriz Operacional",
  "Reiniciado de maneira proporcional",
  "Blend atendido e reiniciado",
  "Blend atendido mais de uma vez",
  "Foram adicionadas novas viagens",
];

export const P2_MOTIVOS_PARCIAL = [
  "Pulmão cheio",
  "Falta de material",
  "Aguardando geração de material",
  "Material com elevada umidade",
  "Falta de frente seca",
  "Baixa disponibilidade de CBs",
  "Baixa disponibilidade de motoristas",
  "Manutenção de equipamento",
  "Parada da planta",
  "Material insuficiente na frente",
  "Material finalizado",
  "Condição operacional",
  "Orientação da Qualidade",
  "Redistribuição das viagens entre outros bancos",
  "Outro",
];

export const P2_MOTIVOS_NAO_ATENDIDO = [
  "Pulmão cheio",
  "Falta de material",
  "Aguardando geração de material",
  "Material com umidade elevada",
  "Falta de frente seca",
  "Rompedor em manutenção",
  "Equipamento em manutenção",
  "Baixa disponibilidade de CBs",
  "Baixa disponibilidade de motoristas",
  "Parada da Planta 02",
  "Orientação da Qualidade",
  "Material finalizado",
  "Falta de condição operacional",
  "Outro",
];

/** Trecho em minúscula usado depois de "em razão de/da". */
export const MOTIVO_FRASE: Record<string, string> = {
  "Pulmão cheio": "pulmão cheio",
  "Falta de material": "falta de material",
  "Aguardando geração de material": "aguardar a geração de material",
  "Material com elevada umidade": "material com elevada umidade",
  "Material com umidade elevada": "material com umidade elevada",
  "Falta de frente seca": "falta de frente seca",
  "Baixa disponibilidade de CBs": "baixa disponibilidade de CBs",
  "Baixa disponibilidade de motoristas": "baixa disponibilidade de motoristas",
  "Manutenção de equipamento": "manutenção de equipamento",
  "Parada da planta": "parada da planta",
  "Parada da Planta 02": "parada da Planta 02",
  "Material insuficiente na frente": "material insuficiente na frente",
  "Material finalizado": "material finalizado",
  "Condição operacional": "condição operacional",
  "Falta de condição operacional": "falta de condição operacional",
  "Orientação da Qualidade": "orientação da Qualidade",
  "Redistribuição das viagens entre outros bancos":
    "redistribuição das viagens entre outros bancos",
  "Rompedor em manutenção": "rompedor em manutenção",
  "Equipamento em manutenção": "equipamento em manutenção",
};

export const OBS_BANCO_SUGESTOES = [
  "material com elevada umidade",
  "necessidade de geração de material",
  "falta de material desmontado",
  "material finalizado",
  "necessidade de atuação do rompedor",
  "acompanhamento da frente",
  "condição da praça de carregamento",
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
  "Houve movimentação de sínter.",
  "Houve movimentação para estoque.",
  "Houve reprocesso.",
  "Houve atividade de aterro.",
  "Houve remanejo.",
];

/* ------------------------------ Paradas operacionais -------------------------- */

export const PARADA_LOCAIS = [
  "Pulmão Planta 01",
  "Pulmão Planta 02",
  "B-1060",
  "B-1030",
  "B-1120",
  "Planta 01",
  "Planta 02",
  "Mina",
  "Acesso",
  "Outro",
];

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
  "Outro",
];

/* ----------------------------------- Tipos ----------------------------------- */

export interface Planta01State {
  situacao: P1Situacao | "";
  motivo: string;
  motivoOutro: string;
  texto: string;
}

export interface SubstituicaoState {
  bancoPrevisto: string;
  bancoUtilizado: string;
  viagens: string;
  motivo: string;
  autorizacao: string;
}

export interface Planta02State {
  situacao: P2Situacao | "";
  complementos: string[];
  motivos: string[];
  motivoOutro: string;
  viagensProgramadas: string;
  viagensRealizadas: string;
  aderencia: string;
  texto: string;
  temSubstituicao: boolean;
  substituicao: SubstituicaoState;
}

export interface BancoState {
  id: string;
  nome: string;
  planta01: Planta01State;
  planta02: Planta02State;
  observacao: string;
}

export interface ParadaState {
  id: string;
  local: string;
  localOutro: string;
  inicio: string;
  fim: string;
  motivo: string;
  motivoOutro: string;
  observacao: string;
}

export interface MovimentacaoState {
  houve: boolean;
  quantidade: string;
  material: string;
  origem: string;
  destino: string;
  pilha: string;
  descricao: string;
  observacao: string;
  orientacao: string;
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
  quantidade: "",
  material: "",
  origem: "",
  destino: "",
  pilha: "",
  descricao: "",
  observacao: "",
  orientacao: "",
});

export const novoBanco = (nome: string): BancoState => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  nome,
  planta01: { situacao: "", motivo: "", motivoOutro: "", texto: "" },
  planta02: {
    situacao: "",
    complementos: [],
    motivos: [],
    motivoOutro: "",
    viagensProgramadas: "",
    viagensRealizadas: "",
    aderencia: "",
    texto: "",
    temSubstituicao: false,
    substituicao: {
      bancoPrevisto: "",
      bancoUtilizado: "",
      viagens: "",
      motivo: "",
      autorizacao: "",
    },
  },
  observacao: "",
});

export const novaParada = (): ParadaState => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  local: "",
  localOutro: "",
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
