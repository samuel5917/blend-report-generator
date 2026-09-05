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

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25"
        style={{ backgroundImage: `url("${imagem}")` }}
      />
      <div className="absolute inset-0 bg-shell/80" />
      <div className="absolute -left-40 -top-40 size-[38rem] rounded-full bg-signal/10 blur-[120px]" />
      <div className="absolute -bottom-52 right-[-10rem] size-[42rem] rounded-full bg-signal/[0.07] blur-[140px]" />
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_-10%,transparent,color-mix(in_oklab,var(--shell)_75%,transparent))]" />
    </div>
  );
}
