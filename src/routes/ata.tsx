import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/ata")({
  head: () => ({
    meta: [
      { title: "Elaboração de Ata | MineShift" },
      {
        name: "description",
        content: "Área do MineShift destinada à elaboração das atas de reunião de turno.",
      },
      { property: "og:title", content: "Elaboração de Ata | MineShift" },
      {
        property: "og:description",
        content: "Área do MineShift destinada à elaboração das atas de reunião de turno.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Ata,
});

function Ata() {
  return (
    <AppShell titulo="Elaboração de Ata" subtitulo="Reuniões de turno" largura="max-w-[900px]">
      <div className="glass-panel px-6 py-10 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-signal">Em preparo</p>
        <h2 className="mt-2 text-xl font-semibold text-foreground">
          Esta área ainda será construída
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-steel2">
          O espaço já está reservado no menu. Quando você quiser, definimos juntos os campos da ata
          e a geração do texto.
        </p>
      </div>
    </AppShell>
  );
}
