export type Situacao = "Operando" | "Disponível" | "Manutenção";
export type ComunicacaoT2 = "Sim" | "Não" | "N/a";
export type Categoria = "Auxiliar" | "Escavadeira" | "Caminhão Báscula";

export const SITUACOES: readonly Situacao[] = ["Operando", "Disponível", "Manutenção"];
export const COMUNICACOES: readonly ComunicacaoT2[] = ["Sim", "Não", "N/a"];
export const CATEGORIAS: readonly Categoria[] = ["Auxiliar", "Escavadeira", "Caminhão Báscula"];
export const TURNOS_EQUIP = ["1°", "2°"] as const;
export type TurnoEquip = (typeof TURNOS_EQUIP)[number];

export interface Equipamento {
  id: string;
  nome: string;
  categoria: Categoria;
  ordem: number;
  ativo: boolean;
}

export interface DadosTurno {
  situacao: Situacao;
  frenteOperacao: string;
  comunicacaoT2: ComunicacaoT2;
  observacaoComunicacao: string;
}

export interface TurnoEquipamentos {
  data: string;
  turno: TurnoEquip;
  dados: Record<string, DadosTurno>;
}

const NOMES_INICIAIS: Array<[string, Categoria]> = [
  ["CA-0002 - Comboio", "Auxiliar"],
  ["CP-0006 - Pipa", "Auxiliar"],
  ["CP-0007 - Pipa", "Auxiliar"],
  ["MN-0001 - Motoniveladora", "Auxiliar"],
  ["MN-0003 - Motoniveladora", "Auxiliar"],
  ["PC-0201 - Pá Carregadeira", "Auxiliar"],
  ["PC-0203 - Pá Carregadeira", "Auxiliar"],
  ["PC-0204 - Pá Carregadeira", "Auxiliar"],
  ["PC-0205 - Pá Carregadeira", "Auxiliar"],
  ["PC-0206 - Pá Carregadeira", "Auxiliar"],
  ["RC-0001 - Rolo Compactador", "Auxiliar"],
  ["EH-0009 - Rompedor", "Auxiliar"],
  ["RP-0002 - Rompedor", "Auxiliar"],
  ["RT-0004 - Retroescavadeira", "Auxiliar"],
  ["TE-0101 - Trator", "Auxiliar"],
  ["TE-0102 - Trator", "Auxiliar"],
  ["EH-0001 - Escavadeira", "Escavadeira"],
  ["EH-0004 - Escavadeira", "Escavadeira"],
  ["EH-0005 - Escavadeira", "Escavadeira"],
  ["EH-0008 - Escavadeira", "Escavadeira"],
  ["CB-0121 - Caminhão Bascula", "Caminhão Báscula"],
  ["CB-1049 - Caminhão Bascula", "Caminhão Báscula"],
  ["CB-1050 - Caminhão Bascula", "Caminhão Báscula"],
  ["CB-1051 - Caminhão Bascula", "Caminhão Báscula"],
  ["CB-1052 - Caminhão Bascula", "Caminhão Báscula"],
  ["CB-1073 - Caminhão Bascula", "Caminhão Báscula"],
  ["CB-1083 - Caminhão Bascula", "Caminhão Báscula"],
  ["CB-1102 - Caminhão Bascula", "Caminhão Báscula"],
  ["CB-1103 - Caminhão Bascula", "Caminhão Báscula"],
  ["CB-1109 - Caminhão Bascula", "Caminhão Báscula"],
  ["CB-1122 - Caminhão Bascula", "Caminhão Báscula"],
  ["CB-1129 - Caminhão Bascula", "Caminhão Báscula"],
  ["CB-1138 - Caminhão Bascula", "Caminhão Báscula"],
  ["CB-1139 - Caminhão Bascula", "Caminhão Báscula"],
  ["CB-2006 - Caminhão Bascula", "Caminhão Báscula"],
];

export function equipamentosIniciais(): Equipamento[] {
  return NOMES_INICIAIS.map(([nome, categoria], i) => ({
    id: `eq-${i + 1}-${nome.slice(0, 7).toLowerCase()}`,
    nome,
    categoria,
    ordem: i,
    ativo: true,
  }));
}

export function dadosVazios(): DadosTurno {
  return {
    situacao: "Disponível",
    frenteOperacao: "",
    comunicacaoT2: "Sim",
    observacaoComunicacao: "",
  };
}

export function hojeISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatarData(iso: string): string {
  if (!iso) return "";
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

const KEY_CADASTRO = "mineshift-equipamentos-cadastro-v1";
const KEY_TURNO = "mineshift-equipamentos-turno-v1";
const KEY_ULTIMO = "mineshift-equipamentos-ultimo-turno-v1";

function ler<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function gravar(key: string, valor: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(valor));
  } catch {
    /* ignora */
  }
}

export function carregarCadastro(): Equipamento[] {
  const salvo = ler<Equipamento[]>(KEY_CADASTRO);
  if (!salvo || !Array.isArray(salvo) || salvo.length === 0) return equipamentosIniciais();
  return salvo
    .filter((e) => e && typeof e.nome === "string")
    .map((e, i) => ({
      id: e.id ?? `eq-${i}`,
      nome: e.nome,
      categoria: CATEGORIAS.includes(e.categoria) ? e.categoria : "Auxiliar",
      ordem: typeof e.ordem === "number" ? e.ordem : i,
      ativo: e.ativo !== false,
    }))
    .sort((a, b) => a.ordem - b.ordem)
    .map((e, i) => ({ ...e, ordem: i }));
}

export function salvarCadastro(lista: Equipamento[]) {
  gravar(
    KEY_CADASTRO,
    lista.map((e, i) => ({ ...e, ordem: i })),
  );
}

export function carregarTurno(): TurnoEquipamentos | null {
  return ler<TurnoEquipamentos>(KEY_TURNO);
}

export function salvarTurno(turno: TurnoEquipamentos) {
  gravar(KEY_TURNO, turno);
}

export function salvarUltimoTurno(turno: TurnoEquipamentos) {
  gravar(KEY_ULTIMO, turno);
}

export function carregarUltimoTurno(): TurnoEquipamentos | null {
  return ler<TurnoEquipamentos>(KEY_ULTIMO);
}
