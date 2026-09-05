import { toPng } from "html-to-image";

const ESCALA = 2.5;

export async function gerarPng(node: HTMLElement): Promise<Blob> {
  const dataUrl = await toPng(node, {
    pixelRatio: ESCALA,
    backgroundColor: "#FFFFFF",
    cacheBust: true,
  });
  const res = await fetch(dataUrl);
  return await res.blob();
}

export async function copiarImagem(blob: Blob): Promise<boolean> {
  try {
    if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) return false;
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return true;
  } catch {
    return false;
  }
}

export function baixarImagem(blob: Blob, nomeArquivo: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function nomeArquivoInforme(dataISO: string, turno: string): string {
  const [a, m, d] = dataISO.split("-");
  const t = turno.replace("°", "");
  return `Informe_de_Equipamentos_${d}-${m}-${a}_${t}T.png`;
}
