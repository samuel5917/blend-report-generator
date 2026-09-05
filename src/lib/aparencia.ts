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
}

const KEY = "mineshift-aparencia-v1";
const EVENTO = "mineshift:aparencia";

export const aparenciaPadrao = (): Aparencia => ({ modo: "padrao" });

export function carregarAparencia(): Aparencia {
  if (typeof window === "undefined") return aparenciaPadrao();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return aparenciaPadrao();
    const v = JSON.parse(raw) as Aparencia;
    return { modo: v.modo === "personalizado" ? "personalizado" : "padrao", imagem: v.imagem };
  } catch {
    return aparenciaPadrao();
  }
}

export function salvarAparencia(a: Aparencia) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(a));
  } catch {
    /* armazenamento cheio: ignora */
  }
  window.dispatchEvent(new CustomEvent(EVENTO));
}

export function useAparencia(): [Aparencia, (a: Aparencia) => void] {
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
