import {
  MOTIVO_FRASE,
  P1_FRASES_SEM_MOV,
  type BancoState,
  type JustificativaState,
  type MovimentacaoState,
  type ParadaState,
} from "@/config/blend";

const clean = (v: string) => v.trim();
const has = (v: string) => clean(v).length > 0;

function motivoTexto(motivo: string, outro: string): string {
  if (motivo === "Outro") return clean(outro).toLowerCase();
  return MOTIVO_FRASE[motivo] ?? clean(motivo).toLowerCase();
}

function listar(itens: string[]): string {
  const l = itens.filter(has);
  if (l.length === 0) return "";
  if (l.length === 1) return l[0]!;
  return `${l.slice(0, -1).join(", ")} e ${l[l.length - 1]}`;
}

function formatarData(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

function trechoViagens(realizadas: string, programadas: string, aderencia: string): string {
  const partes: string[] = [];
  if (has(realizadas) && has(programadas)) {
    partes.push(`${clean(realizadas)} de ${clean(programadas)} viagens realizadas`);
  } else if (has(realizadas)) {
    partes.push(`${clean(realizadas)} viagens realizadas`);
  } else if (has(programadas)) {
    partes.push(`${clean(programadas)} viagens programadas`);
  }
  if (has(aderencia)) {
    partes.push(`aderência de ${clean(aderencia).replace(/%$/, "")}%`);
  }
  return partes.join(", com ");
}

export function textoPlanta01(banco: BancoState): string {
  const p = banco.planta01;
  if (!p.situacao) return "";
  switch (p.situacao) {
    case "Atendido":
      return has(p.texto)
        ? `Blend atendido para o pulmão da Planta 01. ${clean(p.texto)}`
        : "Blend atendido para o pulmão da Planta 01.";
    case "Atendido parcialmente": {
      const motivo = motivoTexto(p.motivo, p.motivoOutro);
      const base = "Blend atendido parcialmente para o pulmão da Planta 01";
      const frase = has(motivo) ? `${base} em razão de ${motivo}.` : `${base}.`;
      return has(p.texto) ? `${frase} ${clean(p.texto)}` : frase;
    }
    case "Não houve movimentação": {
      if (p.motivo === "Outro" && has(p.motivoOutro)) {
        return `Não houve movimentação para o pulmão da Planta 01 em razão de ${clean(
          p.motivoOutro,
        ).toLowerCase()}.`;
      }
      const frase = P1_FRASES_SEM_MOV[p.motivo];
      if (frase) return has(p.texto) ? `${frase} ${clean(p.texto)}` : frase;
      return "Não houve movimentação para o pulmão da Planta 01.";
    }
    case "Outra situação":
      return clean(p.texto);
    default:
      return "";
  }
}

export function textoPlanta02(banco: BancoState): string {
  const p = banco.planta02;
  if (!p.situacao) return "";
  const viagens = trechoViagens(p.viagensRealizadas, p.viagensProgramadas, p.aderencia);
  const partes: string[] = [];

  switch (p.situacao) {
    case "Atendido": {
      const compl = listar(p.complementos).toLowerCase();
      partes.push(
        compl
          ? `Blend atendido para o pulmão da Planta 02 ${
              p.complementos.length === 1 &&
              p.complementos[0]!.toLowerCase().startsWith("conforme")
                ? compl
                : `— ${compl}`
            }.`
          : "Blend atendido para o pulmão da Planta 02.",
      );
      if (viagens) partes.push(`${capitalizar(viagens)}.`);
      break;
    }
    case "Atendido parcialmente": {
      const motivo = listar(
        p.motivos.map((m) => motivoTexto(m, m === "Outro" ? p.motivoOutro : "")),
      );
      partes.push(
        motivo
          ? `Blend atendido parcialmente para o pulmão da Planta 02 em razão de ${motivo}.`
          : "Blend atendido parcialmente para o pulmão da Planta 02.",
      );
      if (viagens) partes.push(`${capitalizar(viagens)}.`);
      break;
    }
    case "Não atendido": {
      const motivo = listar(
        p.motivos.map((m) => motivoTexto(m, m === "Outro" ? p.motivoOutro : "")),
      );
      if (viagens) partes.push(`${capitalizar(viagens)}.`);
      partes.push(
        motivo
          ? `A programação não foi concluída em razão de ${motivo}.`
          : "A programação não foi concluída.",
      );
      break;
    }
    case "Não houve movimentação": {
      const motivo = listar(
        p.motivos.map((m) => motivoTexto(m, m === "Outro" ? p.motivoOutro : "")),
      );
      partes.push(
        motivo
          ? `Não houve movimentação para o pulmão da Planta 02 em razão de ${motivo}.`
          : "Não houve movimentação para o pulmão da Planta 02.",
      );
      break;
    }
    case "Substituído por outro material":
      partes.push("As viagens da frente foram substituídas por outro material.");
      if (viagens) partes.push(`${capitalizar(viagens)}.`);
      break;
    case "Outra situação":
      if (has(p.texto)) partes.push(clean(p.texto));
      if (viagens) partes.push(`${capitalizar(viagens)}.`);
      break;
  }

  if (p.temSubstituicao) {
    const s = p.substituicao;
    const seg: string[] = [];
    const qtd = has(s.viagens) ? `${clean(s.viagens)} viagens` : "As viagens faltantes";
    const prev = has(s.bancoPrevisto) ? ` do ${clean(s.bancoPrevisto)}` : " da frente";
    const util = has(s.bancoUtilizado)
      ? ` foram substituídas por material proveniente do ${clean(s.bancoUtilizado)}`
      : " foram substituídas por outro material";
    seg.push(`${qtd}${prev}${util}`);
    if (has(s.motivo)) seg.push(`em razão de ${clean(s.motivo).toLowerCase()}`);
    if (has(s.autorizacao)) seg.push(`conforme orientação de ${clean(s.autorizacao)}`);
    partes.push(`${seg.join(", ")}.`);
  }

  if (p.situacao !== "Outra situação" && has(p.texto)) partes.push(clean(p.texto));

  return partes.filter(has).join(" ");
}

function capitalizar(t: string): string {
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export function textoParada(parada: ParadaState): string {
  const local = parada.local === "Outro" ? clean(parada.localOutro) : clean(parada.local);
  const motivo =
    parada.motivo === "Outro" ? clean(parada.motivoOutro) : clean(parada.motivo);
  const partes: string[] = [];
  const horario =
    has(parada.inicio) && has(parada.fim)
      ? `${clean(parada.inicio)} às ${clean(parada.fim)}`
      : has(parada.inicio)
        ? `a partir de ${clean(parada.inicio)}`
        : has(parada.fim)
          ? `até ${clean(parada.fim)}`
          : "";
  const head = [local, horario].filter(has).join(": ");
  if (has(head)) partes.push(head);
  const tail = [motivo, clean(parada.observacao)].filter(has).join(". ");
  if (!has(head)) return tail;
  return has(tail) ? `${head} — ${tail}${tail.endsWith(".") ? "" : "."}` : `${head}.`;
}

function textoMovimentacao(
  m: MovimentacaoState,
  opts: { comMaterial?: boolean; comPilha?: boolean; comDescricao?: boolean } = {},
): string {
  if (!m.houve) return "Não houve movimentação.";
  const partes: string[] = [];
  const qtd = has(m.quantidade) ? `${clean(m.quantidade)} viagens` : "Viagens";
  const material = opts.comMaterial && has(m.material) ? ` de ${clean(m.material)}` : "";
  const origem = has(m.origem) ? ` do ${clean(m.origem)}` : "";
  const destino = has(m.destino) ? ` para o ${clean(m.destino)}` : "";
  let frase = `${qtd}${material}${origem}${destino}`;
  if (opts.comPilha && has(m.pilha)) frase += ` — ${clean(m.pilha)}`;
  partes.push(`${frase}.`);
  if (opts.comDescricao && has(m.descricao)) partes.push(`${clean(m.descricao)}.`);
  if (has(m.orientacao)) partes.push(`${clean(m.orientacao)}.`);
  if (has(m.observacao)) partes.push(`${clean(m.observacao)}.`);
  return partes.join(" ");
}

export function gerarJustificativa(state: JustificativaState): string {
  const linhas: string[] = [];
  linhas.push("MOVIMENTAÇÕES DO TURNO E JUSTIFICATIVA DO BLEND");
  linhas.push("");
  linhas.push(`Turno: ${state.turno}`);
  linhas.push(`Data: ${formatarData(state.data)}`);

  const bancos = state.bancos.filter((b) => has(b.nome));
  if (bancos.length > 0) {
    linhas.push("");
    linhas.push("BANCOS");
    for (const banco of bancos) {
      const p1 = textoPlanta01(banco);
      const p2 = textoPlanta02(banco);
      if (!has(p1) && !has(p2) && !has(banco.observacao)) continue;
      linhas.push("");
      linhas.push(`${clean(banco.nome)}:`);
      if (has(p1)) linhas.push(`  Planta 01: ${p1}`);
      if (has(p2)) linhas.push(`  Planta 02: ${p2}`);
      if (has(banco.observacao)) linhas.push(`  Observação: ${clean(banco.observacao)}`);
    }
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
  linhas.push(
    `  OM: ${
      state.om.houve
        ? textoMovimentacao(state.om, { comDescricao: true })
        : "Não houve OM."
    }`,
  );
  linhas.push(
    `  Reprocesso: ${textoMovimentacao(state.reprocesso, { comMaterial: true })}`,
  );
  linhas.push(
    `  Produto para estoque: ${textoMovimentacao(state.estoque, {
      comMaterial: true,
      comPilha: true,
    })}`,
  );
  linhas.push(`  Remanejo: ${textoMovimentacao(state.remanejo, { comMaterial: true })}`);

  return linhas.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
