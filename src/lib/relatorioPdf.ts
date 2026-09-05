import { jsPDF } from "jspdf";
import logoUrl from "@/assets/trindade-logo.png";
import { formatarDataBR, turnoCurto, type Justificativa } from "@/lib/blendRegistros";

/**
 * Relatório consolidado das justificativas do Blend.
 * Segue o padrão corporativo: capa, faixa azul por turno, imagem do controle T2,
 * texto do turno, rodapé e numeração de páginas.
 */

const AZUL: [number, number, number] = [16, 45, 82];
const AZUL_CLARO: [number, number, number] = [37, 84, 145];
const CINZA: [number, number, number] = [110, 118, 128];
const TEXTO: [number, number, number] = [33, 37, 41];

const MARGEM = 18;
const LARGURA = 210;
const ALTURA = 297;
const LIMITE_INFERIOR = ALTURA - 22;

async function comoDataUrl(src: string): Promise<{ dataUrl: string; w: number; h: number } | null> {
  try {
    const resp = await fetch(src);
    const blob = await resp.blob();
    const dataUrl = await new Promise<string>((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(String(fr.result));
      fr.onerror = () => rej(new Error("leitura falhou"));
      fr.readAsDataURL(blob);
    });
    const dim = await new Promise<{ w: number; h: number }>((res) => {
      const img = new Image();
      img.onload = () => res({ w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = () => res({ w: 1600, h: 900 });
      img.src = dataUrl;
    });
    return { dataUrl, ...dim };
  } catch {
    return null;
  }
}

function rodape(doc: jsPDF, pagina: number) {
  doc.setDrawColor(...AZUL_CLARO);
  doc.setLineWidth(0.4);
  doc.line(MARGEM, ALTURA - 16, LARGURA - MARGEM, ALTURA - 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...CINZA);
  doc.text("Relatório Operacional - Trindade Mineração", MARGEM, ALTURA - 11);
  doc.text(`Página ${pagina}`, LARGURA - MARGEM, ALTURA - 11, { align: "right" });
}

export interface OpcoesRelatorio {
  periodoDe?: string;
  periodoAte?: string;
}

export async function gerarRelatorioPdf(
  registros: Justificativa[],
  opcoes: OpcoesRelatorio = {},
): Promise<jsPDF> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  /* ------------------------------- Capa -------------------------------- */
  const logo = await comoDataUrl(logoUrl);
  doc.setFillColor(...AZUL);
  doc.rect(0, 0, LARGURA, 58, "F");
  if (logo) {
    const alturaLogo = 22;
    const larguraLogo = (logo.w / logo.h) * alturaLogo;
    doc.addImage(logo.dataUrl, "PNG", (LARGURA - larguraLogo) / 2, 18, larguraLogo, alturaLogo);
  }

  doc.setTextColor(...AZUL);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text("Justificativas de", LARGURA / 2, 105, { align: "center" });
  doc.text("Movimentações e Blend", LARGURA / 2, 118, { align: "center" });

  doc.setDrawColor(...AZUL_CLARO);
  doc.setLineWidth(0.8);
  doc.line(MARGEM + 25, 128, LARGURA - MARGEM - 25, 128);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.setTextColor(...CINZA);
  doc.text("RELATÓRIO OPERACIONAL", LARGURA / 2, 140, { align: "center" });

  if (registros.length > 0) {
    const de = opcoes.periodoDe ?? registros[0]!.data;
    const ate = opcoes.periodoAte ?? registros[registros.length - 1]!.data;
    doc.setFontSize(11);
    doc.text(
      `Período: ${formatarDataBR(de)} a ${formatarDataBR(ate)}`,
      LARGURA / 2,
      152,
      { align: "center" },
    );
    doc.text(`${registros.length} turno(s) registrado(s)`, LARGURA / 2, 160, { align: "center" });
  }
  rodape(doc, 0);

  /* ----------------------------- Registros ----------------------------- */
  let pagina = 1;
  for (const reg of registros) {
    doc.addPage();
    let y = MARGEM;

    const cabecalhoTurno = () => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...CINZA);
      doc.text("RELATÓRIO DE TURNO", MARGEM, y);
      y += 5;
      doc.setFillColor(...AZUL);
      doc.rect(MARGEM, y, LARGURA - MARGEM * 2, 11, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.text(`${turnoCurto(reg.turno)} - ${formatarDataBR(reg.data)}`, MARGEM + 4, y + 7.6);
      y += 17;
    };

    cabecalhoTurno();
    rodape(doc, pagina);

    const novaPagina = (continuacao = true) => {
      doc.addPage();
      pagina += 1;
      y = MARGEM;
      if (continuacao) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...AZUL);
        doc.text(
          `${turnoCurto(reg.turno)} - ${formatarDataBR(reg.data)} (continuação)`,
          MARGEM,
          y,
        );
        y += 7;
      }
      rodape(doc, pagina);
    };

    // Imagens do controle T2
    for (const img of reg.imagens) {
      const dados = await comoDataUrl(img.url);
      if (!dados) continue;
      const larguraMax = LARGURA - MARGEM * 2;
      let w = larguraMax;
      let h = (dados.h / dados.w) * w;
      const alturaMax = 120;
      if (h > alturaMax) {
        h = alturaMax;
        w = (dados.w / dados.h) * h;
      }
      if (y + h > LIMITE_INFERIOR) novaPagina();
      doc.addImage(dados.dataUrl, "JPEG", MARGEM + (larguraMax - w) / 2, y, w, h);
      y += h + 6;
    }

    // Texto da justificativa
    const larguraTexto = LARGURA - MARGEM * 2;
    for (const bruta of reg.texto.split("\n")) {
      const linha = bruta.replace(/\s+$/, "");
      if (!linha.trim()) {
        y += 3.5;
        continue;
      }
      const titulo = linha === linha.toUpperCase() && /[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(linha);
      doc.setFont("helvetica", titulo ? "bold" : "normal");
      doc.setFontSize(titulo ? 11 : 10);
      doc.setTextColor(...(titulo ? AZUL : TEXTO));
      const recuo = /^\s{2,}/.test(bruta) ? 5 : 0;
      const partes = doc.splitTextToSize(linha.trim(), larguraTexto - recuo) as string[];
      for (const parte of partes) {
        if (y + 6 > LIMITE_INFERIOR) novaPagina();
        doc.text(parte, MARGEM + recuo, y);
        y += titulo ? 6 : 5;
      }
      if (titulo) y += 1.5;
    }

    // Assinatura do registro
    if (y + 10 > LIMITE_INFERIOR) novaPagina();
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(...CINZA);
    doc.text(`Registrado por: ${reg.autor_nome || "não informado"}`, MARGEM, y + 4);

    pagina += 1;
  }

  return doc;
}

export async function urlPreviaRelatorio(
  registros: Justificativa[],
  opcoes?: OpcoesRelatorio,
): Promise<string> {
  const doc = await gerarRelatorioPdf(registros, opcoes);
  return doc.output("bloburl").toString();
}

export async function baixarRelatorio(
  registros: Justificativa[],
  opcoes?: OpcoesRelatorio,
): Promise<void> {
  const doc = await gerarRelatorioPdf(registros, opcoes);
  const de = opcoes?.periodoDe ?? registros[0]?.data ?? "";
  const ate = opcoes?.periodoAte ?? registros[registros.length - 1]?.data ?? "";
  doc.save(`Movimentacoes_e_Blend_${de}_a_${ate}.pdf`);
}
