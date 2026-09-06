import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useMensagens, type MensagemT2 } from "@/lib/mensagens";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/mensagens")({
  head: () => ({
    meta: [
      { title: "Mensagens T2 | CCO TRINDADE" },
      {
        name: "description",
        content:
          "Encontre e copie rapidamente as mensagens operacionais de comunicação com o T2 durante o turno.",
      },
      { property: "og:title", content: "Mensagens T2 | CCO TRINDADE" },
      {
        property: "og:description",
        content: "Pesquise a mensagem operacional e copie o conteúdo com um clique.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MensagensOperacional,
});

function BotaoCopiar({ texto }: { texto: string }) {
  const [copiando, setCopiando] = useState(false);

  const copiar = async () => {
    if (copiando) return;
    setCopiando(true);
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      /* silencioso: o feedback visual já indica a ação */
    }
    setTimeout(() => setCopiando(false), 400);
  };

  return (
    <button
      type="button"
      onClick={() => void copiar()}
      aria-label="Copiar mensagem"
      className={cn(
        "rounded-md px-4 py-2 text-xs font-semibold tracking-wide ring-1 transition-colors",
        copiando
          ? "bg-info text-info-foreground ring-info/60"
          : "bg-ok text-ok-foreground ring-ok/60 hover:brightness-110",
      )}
    >
      {copiando ? "COPIANDO" : "COPIAR"}
    </button>
  );
}

function Cartao({ item }: { item: MensagemT2 }) {
  return (
    <li className="glass-panel px-4 py-4">
      <h2 className="text-[15px] font-semibold text-foreground">{item.nome}</h2>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-steel">{item.mensagem}</p>
      <div className="mt-3 flex justify-end">
        <BotaoCopiar texto={item.mensagem} />
      </div>
    </li>
  );
}

function MensagensOperacional() {
  const { ativas, carregando, erro } = useMensagens();
  const [busca, setBusca] = useState("");

  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return ativas;
    return ativas.filter(
      (m) => m.nome.toLowerCase().includes(q) || m.mensagem.toLowerCase().includes(q),
    );
  }, [ativas, busca]);

  return (
    <AppShell
      titulo="Mensagens T2"
      subtitulo="Mensagens rápidas para comunicação operacional"
      largura="max-w-[860px]"
    >
      <div className="space-y-3">
        <div className="glass-panel flex items-center gap-2 px-3 py-2">
          <Search aria-hidden="true" className="size-4 shrink-0 text-steel2" strokeWidth={1.75} />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar mensagem…"
            aria-label="Pesquisar mensagem"
            className="w-full bg-transparent py-1 text-sm text-foreground outline-none placeholder:text-steel2"
          />
        </div>

        {erro && (
          <p className="rounded-lg bg-danger/10 px-3 py-2 font-mono text-[11px] text-danger">
            {erro}
          </p>
        )}
        {carregando && <p className="text-sm text-steel2">Carregando mensagens…</p>}

        {!carregando && filtradas.length === 0 && (
          <p className="glass-panel px-4 py-6 text-center text-sm text-steel2">
            {ativas.length === 0
              ? "Nenhuma mensagem cadastrada ainda."
              : "Nenhuma mensagem encontrada para esta pesquisa."}
          </p>
        )}

        <ul className="space-y-3">
          {filtradas.map((m) => (
            <Cartao key={m.id} item={m} />
          ))}
        </ul>
      </div>
    </AppShell>
  );
}
