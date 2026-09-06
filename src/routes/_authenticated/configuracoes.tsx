import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { ActionButton } from "@/components/kit";
import { useAparencia, prepararImagemFundo, type FundoModo } from "@/lib/aparencia";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Aparência | CCO TRINDADE" },
      {
        name: "description",
        content:
          "Escolha o fundo da aplicação CCO TRINDADE: composição padrão ou uma imagem do seu computador, com as superfícies de vidro por cima.",
      },
      { property: "og:title", content: "Configurações — Aparência | CCO TRINDADE" },
      {
        property: "og:description",
        content: "Defina o fundo da aplicação e a aparência do CCO TRINDADE.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Configuracoes,
});

function Configuracoes() {
  const [aparencia, salvar] = useAparencia();
  const inputRef = useRef<HTMLInputElement>(null);

  const escolher = (modo: FundoModo) => {
    if (modo === "personalizado" && !aparencia.imagem) {
      inputRef.current?.click();
      return;
    }
    salvar({ ...aparencia, modo });
  };

  const carregarArquivo = async (file: File | undefined) => {
    if (!file) return;
    try {
      const imagem = await prepararImagemFundo(file);
      const ok = salvar({ ...aparencia, modo: "personalizado", imagem });
      if (ok) toast.success("Fundo personalizado aplicado.");
      else toast.error("Não foi possível guardar essa imagem — tente uma menor.");
    } catch {
      toast.error("Não foi possível ler essa imagem.");
    }
  };

  const opcoes: Array<{ modo: FundoModo; titulo: string; texto: string }> = [
    {
      modo: "padrao",
      titulo: "Padrão",
      texto: "Composição industrial discreta com gradientes e iluminação difusa.",
    },
    {
      modo: "personalizado",
      titulo: "Personalizado",
      texto: "Use uma imagem do seu computador atrás das superfícies de vidro.",
    },
  ];

  return (
    <AppShell titulo="Configurações" subtitulo="Aparência" largura="max-w-[900px]">
      <section className="glass-panel p-5">
        <h2 className="text-[15px] font-semibold text-foreground">Fundo da aplicação</h2>
        <p className="mt-1 text-[13px] text-steel2">
          A preferência fica salva neste navegador.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {opcoes.map((o) => {
            const ativo = aparencia.modo === o.modo;
            return (
              <button
                key={o.modo}
                type="button"
                onClick={() => escolher(o.modo)}
                className={cn(
                  "rounded-xl px-4 py-4 text-left ring-1 transition-colors",
                  ativo
                    ? "bg-signal/12 ring-signal/40"
                    : "bg-panel2/40 ring-line hover:bg-panel2/60",
                )}
              >
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "size-3 rounded-full ring-1",
                      ativo ? "bg-signal ring-signal/60" : "ring-line",
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      ativo ? "text-signal" : "text-foreground",
                    )}
                  >
                    {o.titulo}
                  </span>
                </span>
                <span className="mt-1.5 block text-[13px] leading-relaxed text-steel2">
                  {o.texto}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => carregarArquivo(e.target.files?.[0])}
          />
          <ActionButton variant="primary" onClick={() => inputRef.current?.click()}>
            ESCOLHER IMAGEM
          </ActionButton>
          {aparencia.imagem && (
            <ActionButton
              variant="danger"
              onClick={() => {
                salvar({ ...aparencia, modo: "padrao" });
                toast.success("Fundo padrão restaurado.");
              }}
            >
              REMOVER IMAGEM
            </ActionButton>
          )}
        </div>

        <div className="mt-5 border-t border-line pt-4">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="escurecimento" className="text-sm font-semibold text-foreground">
              Escurecimento do fundo
            </label>
            <span className="text-[13px] tabular-nums text-steel2">
              {aparencia.escurecimento}%
            </span>
          </div>
          <p className="mt-1 text-[13px] text-steel2">
            0% deixa o fundo totalmente visível; valores maiores escurecem a imagem.
          </p>
          <input
            id="escurecimento"
            type="range"
            min={0}
            max={100}
            step={5}
            value={aparencia.escurecimento}
            onChange={(e) => salvar({ ...aparencia, escurecimento: Number(e.target.value) })}
            className="mt-3 w-full accent-[var(--signal)]"
          />
        </div>

        {aparencia.imagem && (
          <div className="mt-4 overflow-hidden rounded-lg ring-1 ring-line">
            <img
              src={aparencia.imagem}
              alt="Prévia do fundo escolhido"
              className="h-40 w-full object-cover"
            />
          </div>
        )}
      </section>
    </AppShell>
  );
}
