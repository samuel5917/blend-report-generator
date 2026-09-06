import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { AtalhoCard } from "@/components/AtalhoCard";
import { useAtalhos } from "@/lib/atalhos";
import marcaCCO from "@/assets/cco-trindade-marca.png.asset.json";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "CCO TRINDADE — Hub de sistemas do CCO" },
      {
        name: "description",
        content:
          "Hub do CCO TRINDADE: acesso rápido e direto aos sistemas utilizados pelo Centro de Controle Operacional.",
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

function SistemasCCO() {
  const { ativos, carregando, erro } = useAtalhos();

  return (
    <section className="mt-6">
      <div className="mb-4 flex flex-wrap items-baseline gap-3 px-1">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Sistemas do CCO
        </h2>
        <span className="text-[11px] uppercase tracking-[0.12em] text-steel2">
          abre em nova aba
        </span>
        <Link
          to="/cadastros/atalhos"
          className="ml-auto text-[11px] uppercase tracking-[0.12em] text-signal transition-opacity hover:opacity-75"
        >
          gerenciar atalhos
        </Link>
      </div>

      {erro ? (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-[12px] text-danger">{erro}</p>
      ) : null}

      {carregando ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-panel h-[132px] animate-pulse opacity-60" />
          ))}
        </div>
      ) : ativos.length === 0 ? (
        <div className="glass-panel px-6 py-10 text-center">
          <p className="text-sm text-steel">Nenhum sistema cadastrado ainda.</p>
          <Link
            to="/cadastros/atalhos"
            className="mt-4 inline-block rounded-md bg-signal px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-signal-foreground transition-opacity hover:opacity-90"
          >
            Cadastrar atalhos do CCO
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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
      <div className="glass-panel relative overflow-hidden px-6 py-7 sm:px-9 sm:py-9">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(75%_120%_at_100%_50%,color-mix(in_oklab,var(--signal)_18%,transparent),transparent)]"
        />
        <div className="relative flex items-center gap-6 sm:gap-8">
          <img
            src={marcaCCO.url}
            alt="CCO TRINDADE"
            className="size-20 shrink-0 object-contain sm:size-28"
          />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-signal">
              Centro de Controle Operacional
            </p>
            <h2 className="mt-2 font-display text-3xl leading-none text-foreground sm:text-5xl">
              Central de acesso do turno
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-steel2">
              Todos os sistemas do CCO TRINDADE em um só lugar.
            </p>
          </div>
        </div>
      </div>

      <SistemasCCO />
    </AppShell>
  );
}
