import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Mail, Settings, Tractor } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AtalhoCard } from "@/components/AtalhoCard";
import { useAtalhos } from "@/lib/atalhos";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CCO TRINDADE — Hub de sistemas do CCO" },
      {
        name: "description",
        content:
          "Dashboard do CCO TRINDADE: acesso rápido aos sistemas do CCO, informe de equipamentos, justificativa do blend e cadastros operacionais.",
      },
      { property: "og:title", content: "CCO TRINDADE — Hub de sistemas do CCO" },
      {
        property: "og:description",
        content:
          "Central de atalhos do CCO com acesso direto aos sistemas do turno e às áreas operacionais do CCO TRINDADE.",
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
    Icone: Tractor,
    titulo: "Informe de Equipamentos",
    texto: "Preencha situação, frente e comunicação do turno e exporte a imagem do informe.",
  },
  {
    to: "/blend" as const,
    Icone: BookOpen,
    titulo: "Justificativa do Blend",
    texto: "Monte as movimentações do turno e gere o texto pronto para copiar.",
  },
  {
    to: "/ata" as const,
    Icone: Mail,
    titulo: "Elaboração de Ata",
    texto: "Registro das reuniões de turno.",
  },
  {
    to: "/cadastros/equipamentos" as const,
    Icone: Settings,
    titulo: "Cadastros",
    texto: "Equipamentos, bancos e locais operacionais usados pelo sistema.",
  },
];

function SistemasCCO() {
  const { ativos, carregando, erro } = useAtalhos();

  return (
    <section className="mt-4">
      <div className="mb-3 flex flex-wrap items-center gap-2 px-1">
        <h2 className="text-[15px] font-semibold text-foreground">Sistemas do CCO</h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-steel2">
          abre em nova aba
        </span>
        <Link
          to="/cadastros/atalhos"
          className="ml-auto font-mono text-[10px] uppercase tracking-wide text-signal hover:underline"
        >
          gerenciar atalhos
        </Link>
      </div>

      {erro ? (
        <p className="rounded-lg bg-danger/10 px-3 py-2 font-mono text-[11px] text-danger">{erro}</p>
      ) : null}

      {carregando ? (
        <p className="px-1 text-sm text-steel2">Carregando sistemas…</p>
      ) : ativos.length === 0 ? (
        <div className="glass-panel px-5 py-6 text-center">
          <p className="text-sm text-steel">Nenhum sistema cadastrado ainda.</p>
          <Link
            to="/cadastros/atalhos"
            className="mt-3 inline-block rounded-md bg-signal/15 px-3 py-2 font-mono text-[10px] uppercase tracking-wide text-signal ring-1 ring-signal/35"
          >
            Cadastrar atalhos do CCO
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {ativos.map((a) => (
            <AtalhoCard key={a.id} atalho={a} />
          ))}
        </div>
      )}
    </section>
  );
}

function Inicio() {
  return (
    <AppShell titulo="CCO TRINDADE" subtitulo="Hub operacional do CCO" largura="max-w-[1100px]">
      <div className="glass-panel px-6 py-7 sm:px-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-signal">CCO TRINDADE</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Central de acesso do turno.
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-steel">
          Abra os sistemas do CCO com um clique e use o menu no topo para as áreas do CCO TRINDADE.
        </p>
      </div>

      <SistemasCCO />

      <section className="mt-6">
        <h2 className="mb-3 px-1 text-[15px] font-semibold text-foreground">
          Outras informações do sistema
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {ATALHOS.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="glass-panel group px-5 py-5 transition-[transform,background-color] duration-200 hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="grid size-9 shrink-0 place-items-center rounded-lg bg-signal/12 text-foreground ring-1 ring-signal/30"
                >
                  <a.Icone className="size-[18px]" strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-[15px] font-semibold text-foreground">{a.titulo}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-steel2">{a.texto}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
