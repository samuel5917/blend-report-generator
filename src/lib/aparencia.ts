import { useEffect, useState } from "react";

/**
 * Preferência de fundo da aplicação (apenas apresentação visual).
 * Guardada localmente — pronta para, no futuro, aceitar outras fontes de imagem.
 */

export type FundoModo = "padrao" | "personalizado";

export interface Aparencia {
  modo: FundoModo;
  /** Data URL da imagem escolhida pelo usuário (opcional). */
  imagem?: string;
  /** Intensidade do escurecimento sobre o fundo: 0 = totalmente translúcido. */
  escurecimento: number;
}

const KEY = "mineshift-aparencia-v1";
const EVENTO = "mineshift:aparencia";

export const aparenciaPadrao = (): Aparencia => ({ modo: "padrao", escurecimento: 45 });

export function carregarAparencia(): Aparencia {
  if (typeof window === "undefined") return aparenciaPadrao();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return aparenciaPadrao();
    const v = JSON.parse(raw) as Aparencia;
    return {
      modo: v.modo === "personalizado" ? "personalizado" : "padrao",
      escurecimento:
        typeof v.escurecimento === "number"
          ? Math.min(100, Math.max(0, v.escurecimento))
          : 45,
      ...(typeof v.imagem === "string" ? { imagem: v.imagem } : {}),
    };
  } catch {
    return aparenciaPadrao();
  }
}

/** Guarda a preferência. Devolve false quando o armazenamento recusou a imagem. */
export function salvarAparencia(a: Aparencia): boolean {
  if (typeof window === "undefined") return false;
  let ok = true;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(a));
  } catch {
    ok = false;
    try {
      window.localStorage.setItem(
        KEY,
        JSON.stringify({ modo: "padrao", escurecimento: a.escurecimento }),
      );
    } catch {
      /* ignora */
    }
  }
  window.dispatchEvent(new CustomEvent(EVENTO));
  return ok;
}

/**
 * Reduz a imagem escolhida para caber no armazenamento do navegador,
 * devolvendo uma data URL JPEG leve.
 */
export function prepararImagemFundo(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const maxLargura = 1920;
      const escala = Math.min(1, maxLargura / (img.naturalWidth || maxLargura));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round((img.naturalWidth || maxLargura) * escala));
      canvas.height = Math.max(1, Math.round((img.naturalHeight || maxLargura) * escala));
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("sem canvas"));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      let qualidade = 0.82;
      let dataUrl = canvas.toDataURL("image/jpeg", qualidade);
      // Alvo ~1.5 MB de data URL para caber com folga no armazenamento local.
      while (dataUrl.length > 1_500_000 && qualidade > 0.4) {
        qualidade -= 0.12;
        dataUrl = canvas.toDataURL("image/jpeg", qualidade);
      }
      resolve(dataUrl);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("imagem inválida"));
    };
    img.src = url;
  });
}

export function useAparencia(): [Aparencia, (a: Aparencia) => boolean] {
  const [aparencia, setAparencia] = useState<Aparencia>(aparenciaPadrao);

  useEffect(() => {
    const sync = () => setAparencia(carregarAparencia());
    sync();
    window.addEventListener(EVENTO, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENTO, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return [aparencia, salvarAparencia];
}
