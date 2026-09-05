import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MineShift — Painel operacional de turno" },
      {
        name: "description",
        content:
          "Painel do MineShift: informe de equipamentos, justificativa do blend e cadastros operacionais em um só lugar.",
      },
      { property: "og:title", content: "MineShift — Painel operacional de turno" },
      {
        property: "og:description",
        content:
          "Acesse o informe de equipamentos, a justificativa do blend e os cadastros do MineShift.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Inicio,
});

const ATALHOS = [
  {
    to: "/equipamentos" as const,
    icone: "📋",
    titulo: "Informe de Equipamentos",
    texto: "Preencha situação, frente e comunicação do turno e exporte a imagem do informe.",
  },
  {
    to: "/blend" as const,
    icone: "🔀",
    titulo: "Justificativa do Blend",
    texto: "Monte as movimentações do turno e gere o texto pronto para copiar.",
  },
  {
    to: "/ata" as const,
    icone: "📝",
    titulo: "Elaboração de Ata",
    texto: "Registro das reuniões de turno.",
  },
  {
    to: "/cadastros/equipamentos" as const,
    icone: "⚙",
    titulo: "Cadastros",
    texto: "Equipamentos, bancos e locais operacionais usados pelo sistema.",
  },
];

function Inicio() {
  return (
    <AppShell titulo="MineShift" subtitulo="Painel operacional de turno" largura="max-w-[1100px]">
      <div className="glass-panel px-6 py-8 sm:px-8 sm:py-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-signal">MineShift</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Turno sob controle, do informe à justificativa.
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-steel">
          Use o botão de menu no topo para navegar entre as áreas do sistema.
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {ATALHOS.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="glass-panel group px-5 py-5 transition-[transform,background-color] duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="grid size-9 shrink-0 place-items-center rounded-lg bg-signal/12 text-sm ring-1 ring-signal/30"
              >
                {a.icone}
              </span>
              <div className="min-w-0">
                <h3 className="text-[15px] font-semibold text-foreground">{a.titulo}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-steel2">{a.texto}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
