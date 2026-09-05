import type { ComunicacaoT2, DadosTurno, Equipamento, Situacao } from "@/lib/equipamentos";
import { dadosVazios } from "@/lib/equipamentos";
import logo from "@/assets/trindade-logo.png";

/* Documento oficial: fundo branco, bordas preta finas, fonte Calibri.
   Nada aqui usa tokens do tema — é um papel, não uma tela. */

export const DOC_LARGURA = 966;
const ALTURA_PAGINA = 1123; // A4 retrato @96dpi
const ALTURA_LINHA = 20;
const ALTURA_CABECALHO = 46 + 21 + 20; // logo + subtítulo + títulos das colunas
const ALTURA_DIVISOR = 12;

const COLS = [185, 90, 455, 60, 176];

type Item =
  | { tipo: "linha"; eq: Equipamento; dados: DadosTurno }
  | { tipo: "divisor"; chave: string };

function corSituacao(s: Situacao): { background: string; color: string } {
  if (s === "Operando") return { background: "#C6EFCE", color: "#0B5D1E" };
  if (s === "Manutenção") return { background: "#FFC7CE", color: "#9C0006" };
  return { background: "#FFFFFF", color: "#000000" };
}

function corComunicacao(c: ComunicacaoT2): { background: string; color: string } {
  if (c === "Sim") return { background: "#C6EFCE", color: "#0B5D1E" };
  if (c === "Não") return { background: "#FFC7CE", color: "#9C0006" };
  return { background: "#FCE4D6", color: "#C55A11" };
}

export function montarItens(equipamentos: Equipamento[], dados: Record<string, DadosTurno>): Item[] {
  const ativos = equipamentos.filter((e) => e.ativo);
  const itens: Item[] = [];
  let categoriaAnterior: string | null = null;
  ativos.forEach((eq) => {
    if (categoriaAnterior !== null && eq.categoria !== categoriaAnterior) {
      itens.push({ tipo: "divisor", chave: `div-${eq.id}` });
    }
    categoriaAnterior = eq.categoria;
    itens.push({ tipo: "linha", eq, dados: dados[eq.id] ?? dadosVazios() });
  });
  return itens;
}

export function paginar(itens: Item[]): Item[][] {
  const disponivel = ALTURA_PAGINA - ALTURA_CABECALHO - 24;
  const paginas: Item[][] = [];
  let atual: Item[] = [];
  let altura = 0;
  itens.forEach((item) => {
    const h = item.tipo === "divisor" ? ALTURA_DIVISOR : ALTURA_LINHA;
    if (altura + h > disponivel && atual.length > 0) {
      paginas.push(atual);
      atual = [];
      altura = 0;
    }
    if (item.tipo === "divisor" && atual.length === 0) return;
    atual.push(item);
    altura += h;
  });
  if (atual.length > 0) paginas.push(atual);
  return paginas.length > 0 ? paginas : [[]];
}

const borda = "1px solid #000000";

function celula(extra?: React.CSSProperties): React.CSSProperties {
  return {
    border: borda,
    padding: "0 4px",
    height: ALTURA_LINHA,
    fontSize: 12,
    lineHeight: "18px",
    verticalAlign: "middle",
    whiteSpace: "nowrap",
    overflow: "hidden",
    ...extra,
  };
}

function Pagina({ itens, subtitulo }: { itens: Item[]; subtitulo: string | null }) {
  return (
    <table
      style={{
        width: DOC_LARGURA,
        borderCollapse: "collapse",
        tableLayout: "fixed",
        background: "#FFFFFF",
        fontFamily: "Calibri, Carlito, 'Segoe UI', Arial, sans-serif",
        color: "#000000",
      }}
    >
      <colgroup>
        {COLS.map((w, i) => (
          <col key={i} style={{ width: w }} />
        ))}
      </colgroup>
      <tbody>
        <tr>
          <td
            style={{
              border: borda,
              height: subtitulo ? 46 : 46,
              padding: "3px 6px",
              textAlign: "center",
              verticalAlign: "middle",
            }}
            rowSpan={subtitulo ? 2 : 1}
          >
            <img src={logo} alt="Trindade Mineração" style={{ width: 150, display: "inline" }} />
          </td>
          <td
            colSpan={4}
            style={{
              border: borda,
              textAlign: "center",
              fontSize: 19,
              fontWeight: 700,
              height: subtitulo ? 25 : 46,
            }}
          >
            Informe de Turno
          </td>
        </tr>
        {subtitulo ? (
          <tr>
            <td
              colSpan={4}
              style={{
                border: borda,
                textAlign: "center",
                fontSize: 14,
                fontWeight: 700,
                height: 21,
              }}
            >
              {subtitulo}
            </td>
          </tr>
        ) : null}
        <tr>
          <td style={celula({ textAlign: "center", fontWeight: 700 })}>Equipamento</td>
          <td style={celula({ textAlign: "center", fontWeight: 700 })}>Situação</td>
          <td style={celula({ textAlign: "center", fontWeight: 700 })}>Frente de Operação</td>
          <td colSpan={2} style={celula({ textAlign: "center", fontWeight: 700 })}>
            Comunicação com T2
          </td>
        </tr>
        {itens.map((item) =>
          item.tipo === "divisor" ? (
            <tr key={item.chave}>
              <td
                colSpan={5}
                style={{ border: borda, background: "#262626", height: ALTURA_DIVISOR }}
              />
            </tr>
          ) : (
            <tr key={item.eq.id}>
              <td style={celula({ fontWeight: 700 })}>{item.eq.nome}</td>
              <td style={celula({ fontWeight: 700, ...corSituacao(item.dados.situacao) })}>
                {item.dados.situacao}
              </td>
              <td style={celula()}>{item.dados.frenteOperacao || "N/a"}</td>
              <td style={celula({ fontWeight: 700, ...corComunicacao(item.dados.comunicacaoT2) })}>
                {item.dados.comunicacaoT2}
              </td>
              <td style={celula()}>{item.dados.observacaoComunicacao}</td>
            </tr>
          ),
        )}
      </tbody>
    </table>
  );
}

export function InformeDocumento({
  equipamentos,
  dados,
  refDocumento,
}: {
  equipamentos: Equipamento[];
  dados: Record<string, DadosTurno>;
  refDocumento?: React.Ref<HTMLDivElement>;
}) {
  const paginas = paginar(montarItens(equipamentos, dados));

  return (
    <div
      ref={refDocumento}
      style={{
        width: DOC_LARGURA,
        background: "#FFFFFF",
        padding: 0,
        display: "flex",
        flexDirection: "column",
        gap: 46,
      }}
    >
      {paginas.map((itens, i) => (
        <Pagina key={i} itens={itens} subtitulo={i === 0 ? "Equipamentos Auxiliares" : null} />
      ))}
    </div>
  );
}
