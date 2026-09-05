import { useAparencia } from "@/lib/aparencia";
import minaBg from "@/assets/mina-bg.jpg";

/**
 * Composição de fundo do MineShift: imagem discreta + gradientes difusos.
 * Fica atrás de todas as superfícies translúcidas.
 */
export function AppBackground() {
  const [aparencia] = useAparencia();
  const imagem =
    aparencia.modo === "personalizado" && aparencia.imagem ? aparencia.imagem : minaBg;

  const nivel = Math.min(100, Math.max(0, aparencia.escurecimento ?? 45)) / 100;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url("${imagem}")`, opacity: 1 - nivel * 0.35 }}
      />
      <div
        className="absolute inset-0 bg-shell"
        style={{ opacity: nivel }}
      />
      <div className="absolute -left-40 -top-40 size-[38rem] rounded-full bg-signal/[0.06] blur-[120px]" />
      <div className="absolute -bottom-52 right-[-10rem] size-[42rem] rounded-full bg-signal/[0.04] blur-[140px]" />
      <div
        className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_-10%,transparent,var(--shell))]"
        style={{ opacity: nivel * 0.9 }}
      />
    </div>
  );
}
