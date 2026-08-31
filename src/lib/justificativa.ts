import type {
  BancoState,
  JustificativaState,
  MovimentacaoState,
  ParadaState,
  PlantaState,
} from "@/config/blend";

const clean = (v: string) => v.trim();
const has = (v: string) => clean(v).length > 0;

function formatarData(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

function motivoTexto(p: PlantaState): string {
  if (p.motivo === "Outros") return clean(p.motivoOutro);
  return clean(p.motivo);
}

/** Texto de uma planta, conforme as regras do informe. */
export function textoPlanta(p: PlantaState): string {
  switch (p.situacao) {
    case "Atendido":
      return "Atendido. Ok.";
    case "Não Atendido":
    case "Atendido Parcialmente": {
      const motivo = motivoTexto(p);
      return has(motivo) ? `${p.situacao}. Motivo: ${motivo}.` : `${p.situacao}.`;
    }
    case "Outros":
      return has(p.texto) ? clean(p.texto) : "";
    default:
      return "";
  }
}

export const textoPlanta01 = (b: BancoState) => textoPlanta(b.planta01);
export const textoPlanta02 = (b: BancoState) => textoPlanta(b.planta02);

export function textoParada(parada: ParadaState): string {
  const local = clean(parada.local);
  const motivo = parada.motivo === "Outros" ? clean(parada.motivoOutro) : clean(parada.motivo);
  const horario =
    has(parada.inicio) && has(parada.fim)
      ? `${clean(parada.inicio)} às ${clean(parada.fim)}`
      : has(parada.inicio)
        ? `a partir de ${clean(parada.inicio)}`
        : has(parada.fim)
          ? `até ${clean(parada.fim)}`
          : "";
  const head = [local, horario].filter(has).join(": ");
  const tail = [motivo, clean(parada.observacao)].filter(has).join(". ");
  if (!has(head)) return tail;
  return has(tail) ? `${head} — ${tail}${tail.endsWith(".") ? "" : "."}` : `${head}.`;
}

/** OM / Reprocesso / Estoque / Remanejo. */
export function textoMovimentacao(m: MovimentacaoState): string {
  if (!m.houve) return "Não houve. Ok.";
  const partes: string[] = ["Houve"];
  if (has(m.origem)) partes.push(`do ${clean(m.origem)}`);
  if (has(m.destino)) partes.push(`para o ${clean(m.destino)}`);
  const qtd = clean(m.quantidade);
  if (has(qtd)) partes.push(`com ${qtd} ${qtd === "1" ? "viagem" : "viagens"}`);
  return `${partes.join(", ")}.`;
}

export function gerarJustificativa(state: JustificativaState): string {
  const linhas: string[] = [];
  linhas.push("MOVIMENTAÇÕES DO TURNO E JUSTIFICATIVA DO BLEND");
  linhas.push("");
  linhas.push(`Turno: ${state.turno}`);
  linhas.push(`Data: ${formatarData(state.data)}`);

  const bancos = state.bancos.filter((b) => has(b.nome));
  const linhasBancos: string[] = [];
  for (const banco of bancos) {
    const p1 = textoPlanta(banco.planta01);
    const p2 = textoPlanta(banco.planta02);
    if (!has(p1) && !has(p2) && !has(banco.observacao)) continue;
    linhasBancos.push("");
    linhasBancos.push(`${clean(banco.nome)}:`);
    if (has(p1)) linhasBancos.push(`  Planta-01: ${p1}`);
    if (has(p2)) linhasBancos.push(`  Planta-02: ${p2}`);
    if (has(banco.observacao)) linhasBancos.push(`  Observação: ${clean(banco.observacao)}`);
  }
  if (linhasBancos.length > 0) {
    linhas.push("");
    linhas.push("BANCOS");
    linhas.push(...linhasBancos);
  }

  const obs = state.observacoes.filter(has);
  if (obs.length > 0) {
    linhas.push("");
    linhas.push("OUTRAS OBSERVAÇÕES");
    for (const o of obs) linhas.push(`  ${clean(o)}`);
  }

  const paradas = state.paradas.map(textoParada).filter(has);
  if (paradas.length > 0) {
    linhas.push("");
    linhas.push("PARADAS OPERACIONAIS");
    for (const p of paradas) linhas.push(`  ${p}`);
  }

  linhas.push("");
  linhas.push("OUTRAS MOVIMENTAÇÕES");
  linhas.push(`  OM: ${textoMovimentacao(state.om)}`);
  linhas.push(`  Reprocesso: ${textoMovimentacao(state.reprocesso)}`);
  linhas.push(`  Estoque: ${textoMovimentacao(state.estoque)}`);
  linhas.push(`  Remanejo: ${textoMovimentacao(state.remanejo)}`);

  return linhas.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
