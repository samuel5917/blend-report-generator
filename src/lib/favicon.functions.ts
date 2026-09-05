import { createServerFn } from "@tanstack/react-start";

/**
 * Descoberta de favicon no servidor (evita bloqueio de CORS no navegador).
 * Analisa o HTML do site, procura <link rel="icon|shortcut icon|apple-touch-icon">,
 * cai para /favicon.ico, /favicon.png e, por último, um serviço público de favicon.
 * Retorna o ícone já embutido como data URL, para ficar salvo no cadastro.
 */

export interface ResultadoIcone {
  /** Data URL do ícone encontrado (vazio se nada funcionou). */
  dataUrl: string;
  /** Endereço original de onde o ícone veio (referência). */
  origem: string;
  /** Como o ícone foi encontrado. */
  fonte: "html" | "raiz" | "servico" | "nenhum";
}

const LIMITE = 300 * 1024;
const TEMPO = 6000;

async function baixar(url: string): Promise<Response | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), TEMPO);
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
        accept: "*/*",
      },
    });
    clearTimeout(t);
    return res.ok ? res : null;
  } catch {
    return null;
  }
}

async function comoDataUrl(url: string): Promise<string> {
  const res = await baixar(url);
  if (!res) return "";
  const tipo = (res.headers.get("content-type") ?? "").split(";")[0]?.trim() ?? "";
  if (tipo.startsWith("text/") || tipo.includes("json") || tipo.includes("html")) return "";
  const buf = new Uint8Array(await res.arrayBuffer());
  if (buf.byteLength === 0 || buf.byteLength > LIMITE) return "";
  let bin = "";
  for (const b of buf) bin += String.fromCharCode(b);
  const mime = tipo || (url.endsWith(".svg") ? "image/svg+xml" : "image/x-icon");
  return `data:${mime};base64,${btoa(bin)}`;
}

/** Extrai candidatos de ícone declarados no HTML, em ordem de preferência. */
function candidatosDoHtml(html: string, base: URL): string[] {
  const tags = html.match(/<link\b[^>]*>/gi) ?? [];
  const grupos: [number, string][] = [];
  for (const tag of tags) {
    const rel = /rel\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1]?.toLowerCase() ?? "";
    if (!/(^|\s)(icon|shortcut icon|apple-touch-icon(-precomposed)?)(\s|$)/.test(rel)) continue;
    const href = /href\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1];
    if (!href) continue;
    const peso = rel.includes("apple") ? 2 : rel.includes("shortcut") ? 1 : 0;
    try {
      grupos.push([peso, new URL(href, base).toString()]);
    } catch {
      /* href inválido */
    }
  }
  return grupos.sort((a, b) => a[0] - b[0]).map(([, u]) => u);
}

export const descobrirIcone = createServerFn({ method: "POST" })
  .inputValidator((input: { url: string }) => {
    const bruta = String(input?.url ?? "").trim();
    if (!bruta) throw new Error("Informe o endereço do site.");
    return { url: /^https?:\/\//i.test(bruta) ? bruta : `https://${bruta}` };
  })
  .handler(async ({ data }): Promise<ResultadoIcone> => {
    let base: URL;
    try {
      base = new URL(data.url);
    } catch {
      return { dataUrl: "", origem: "", fonte: "nenhum" };
    }

    const candidatos: string[] = [];
    const pagina = await baixar(base.toString());
    if (pagina) {
      const tipo = pagina.headers.get("content-type") ?? "";
      if (tipo.includes("html")) {
        const html = (await pagina.text()).slice(0, 400_000);
        candidatos.push(...candidatosDoHtml(html, new URL(pagina.url || base.toString())));
      }
    }
    const doHtml = candidatos.length;
    candidatos.push(`${base.origin}/favicon.ico`, `${base.origin}/favicon.png`);

    for (const [i, cand] of candidatos.entries()) {
      const dataUrl = await comoDataUrl(cand);
      if (dataUrl) {
        return { dataUrl, origem: cand, fonte: i < doHtml ? "html" : "raiz" };
      }
    }

    // Último recurso: serviço público de favicon por domínio.
    const servico = `https://www.google.com/s2/favicons?sz=128&domain=${encodeURIComponent(base.hostname)}`;
    const dataUrl = await comoDataUrl(servico);
    if (dataUrl) return { dataUrl, origem: servico, fonte: "servico" };

    return { dataUrl: "", origem: "", fonte: "nenhum" };
  });
