import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { iconePreferido, type AtalhoCCO } from "@/lib/atalhos";
import { cn } from "@/lib/utils";

/** Ícone do site com prioridade personalizado → favicon → fallback discreto. */
export function IconeAtalho({ atalho, tamanho = 44 }: { atalho: AtalhoCCO; tamanho?: number }) {
  const src = iconePreferido(atalho);
  const [falhou, setFalhou] = useState(false);

  useEffect(() => setFalhou(false), [src]);

  if (!src || falhou) {
    return (
      <span
        aria-hidden="true"
        className="grid place-items-center rounded-lg bg-signal/12 text-signal ring-1 ring-signal/30"
        style={{ width: tamanho, height: tamanho }}
      >
        <Globe className="size-[55%]" strokeWidth={1.75} />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      onError={() => setFalhou(true)}
      className="rounded-lg bg-panel2/60 object-contain p-1 ring-1 ring-line"
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
        "hover:-translate-y-1 hover:bg-panel2/50 hover:shadow-[0_0_0_1px_rgba(56,189,248,0.35),0_10px_30px_-12px_rgba(56,189,248,0.45)]",
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
