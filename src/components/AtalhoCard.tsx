import { useEffect, useState } from "react";
import { iconePreferido, iniciaisDoNome, type AtalhoCCO } from "@/lib/atalhos";
import { cn } from "@/lib/utils";

export type DadosIcone = Pick<AtalhoCCO, "nome" | "icone_url" | "icone_personalizado">;

/** Ícone salvo do site; sem ícone, mostra as iniciais do sistema. */
export function IconeAtalho({ atalho, tamanho = 44 }: { atalho: DadosIcone; tamanho?: number }) {
  const src = iconePreferido(atalho);
  const [falhou, setFalhou] = useState(false);

  useEffect(() => setFalhou(false), [src]);

  if (!src || falhou) {
    return (
      <span
        aria-hidden="true"
        className="grid shrink-0 place-items-center rounded-lg bg-signal/12 font-mono font-semibold text-signal ring-1 ring-signal/30"
        style={{ width: tamanho, height: tamanho, fontSize: Math.round(tamanho * 0.34) }}
      >
        {iniciaisDoNome(atalho.nome)}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      onError={() => setFalhou(true)}
      className="shrink-0 rounded-lg bg-panel2/60 object-contain p-1 ring-1 ring-line"
      style={{ width: tamanho, height: tamanho }}
    />
  );
}
/** Card clicável que abre o sistema em uma nova aba. */
export function AtalhoCard({ atalho, className }: { atalho: AtalhoCCO; className?: string }) {
  return (
    <a
      href={atalho.url}
      target="_blank"
      rel="noopener noreferrer"
      title={atalho.descricao || atalho.nome}
      className={cn(
        "glass-panel group flex cursor-pointer flex-col items-center gap-3 px-4 py-5 text-center",
        "transition-[transform,box-shadow,background-color] duration-200",
        "hover:-translate-y-1 hover:border-signal/60 hover:bg-panel2/70 hover:shadow-lg",
        className,
      )}
    >
      <IconeAtalho atalho={atalho} />
      <span className="w-full truncate text-[15px] font-semibold text-foreground">
        {atalho.nome}
      </span>
      {atalho.descricao ? (
        <span className="line-clamp-2 text-[12px] leading-relaxed text-steel2">
          {atalho.descricao}
        </span>
      ) : null}
    </a>
  );
}
