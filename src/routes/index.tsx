import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  OBS_TURNO_SUGESTOES,
  PARADA_MOTIVOS,
  TURNOS,
  estadoInicial,
  novaParada,
  novoBanco,
  normalizarEstado,
  type JustificativaState,
  type Turno,
} from "@/config/blend";
import { useLocais } from "@/lib/locais";
import { gerarJustificativa, textoParada } from "@/lib/justificativa";
import { duplicarDraft, excluirDraft, listarDrafts, salvarDraft, type Draft } from "@/lib/drafts";
import { BancoCard } from "@/components/BancoCard";
import { MovimentacaoLista } from "@/components/MovimentacaoLista";
import {
  ActionButton,
  Chip,
  Label,
  Section,
  SelectField,
  TextArea,
  TextField,
} from "@/components/kit";
import minaBg from "@/assets/mina-bg.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gerador de Justificativa do Blend | Movimentações do Turno" },
      {
        name: "description",
        content:
          "Gere Movimentações do Turno e Justificativa do Blend em poucos cliques: bancos, plantas, paradas, reprocesso, estoque e remanejo em texto pronto para copiar.",
      },
      {
        property: "og:title",
        content: "Gerador de Justificativa do Blend | Movimentações do Turno",
      },
      {
        property: "og:description",
        content:
          "Formulário operacional que monta automaticamente a justificativa do Blend do turno, sem digitação manual.",
      },
    ],
  }),
  component: Index,
});

const AUTOSAVE_KEY = "blend-rascunho-atual-v1";

function Index() {
  const [state, setState] = useState<JustificativaState>(estadoInicial);
  const [abertas, setAbertas] = useState<Record<string, boolean>>({
    bancos: true,
    obs: false,
    paradas: false,
    mov: false,
  });
  const [bancoCustom, setBancoCustom] = useState("");
  const [texto, setTexto] = useState("");
  const [editando, setEditando] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [draftId, setDraftId] = useState<string | undefined>(undefined);
  const [historicoAberto, setHistoricoAberto] = useState(false);
  const [copiado, setCopiado] = useState(false);

  // carrega rascunho automático + histórico
  useEffect(() => {
    setDrafts(listarDrafts());
    try {
      const raw = window.localStorage.getItem(AUTOSAVE_KEY);
      if (raw) setState(normalizarEstado(JSON.parse(raw) as JustificativaState));
    } catch {
      /* rascunho inválido: ignora */
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(state));
  }, [state]);

  const previa = useMemo(() => gerarJustificativa(state), [state]);
  const exibido = editando ? texto : texto || previa;

  const set = (patch: Partial<JustificativaState>) => setState((s) => ({ ...s, ...patch }));
  const toggleSecao = (k: string) => setAbertas((a) => ({ ...a, [k]: !a[k] }));

  const bancosSelecionados = state.bancos.map((b) => b.nome);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(exibido);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 1800);
    } catch {
      /* clipboard indisponível */
    }
  };

  const salvar = () => {
    const lista = salvarDraft(state, exibido || previa, draftId);
    setDrafts(lista);
    if (!draftId && lista[0]) setDraftId(lista[0].id);
  };

  const abrirDraft = (d: Draft) => {
    setState(normalizarEstado(d.state));
    setTexto(d.texto);
    setEditando(false);
    setDraftId(d.id);
    setHistoricoAberto(false);
  };

  const novaJustificativa = () => {
    setState(estadoInicial());
    setTexto("");
    setEditando(false);
    setDraftId(undefined);
  };

  return (
    <div className="relative min-h-screen">
      <img
        src={minaBg}
        alt=""
        aria-hidden="true"
        width={1920}
        height={1080}
        className="pointer-events-none fixed inset-0 size-full object-cover opacity-30"
      />
      <div className="pointer-events-none fixed inset-0 bg-shell/70" />

      <div className="relative">
        <header className="border-b border-line bg-shell/60 backdrop-blur-md">
          <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-5 py-3">
            <div className="grid size-9 place-items-center rounded-md bg-signal/15 font-mono text-xs font-semibold text-signal ring-1 ring-signal/40">
              MB
            </div>
            <div className="leading-tight">
              <h1 className="text-sm font-semibold text-foreground">Movimentações do Turno</h1>
              <p className="font-mono text-[11px] uppercase tracking-wide text-steel2">
                Gerador de Justificativa do Blend
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Link
                to="/equipamentos"
                className="rounded-md px-3 py-2 text-xs font-semibold tracking-wide text-steel ring-1 ring-line transition-colors hover:text-foreground"
              >
                EQUIPAMENTOS
              </Link>
              <ActionButton onClick={salvar}>SALVAR RASCUNHO</ActionButton>
              <ActionButton onClick={() => setHistoricoAberto((v) => !v)}>
                HISTÓRICO ({drafts.length})
              </ActionButton>
            </div>
          </div>
        </header>

        {historicoAberto && (
          <div className="mx-auto max-w-[1440px] px-5 pt-5">
            <div className="rounded-xl bg-panel p-4 ring-1 ring-line backdrop-blur-md">
              <div className="mb-3 font-mono text-[10px] uppercase tracking-wide text-steel2">
                Histórico salvo no navegador
              </div>
              {drafts.length === 0 ? (
                <p className="text-sm text-steel2">Nenhuma justificativa salva ainda.</p>
              ) : (
                <ul className="space-y-2">
                  {drafts.map((d) => (
                    <li
                      key={d.id}
                      className="flex flex-wrap items-center gap-3 rounded-lg bg-panel2/40 px-3 py-2 ring-1 ring-line"
                    >
                      <button
                        type="button"
                        onClick={() => abrirDraft(d)}
                        className="flex flex-1 flex-wrap items-center gap-3 text-left font-mono text-xs"
                      >
                        <span className="text-foreground">
                          {d.state.data} · Turno {d.state.turno}
                        </span>
                        <span className="text-steel2">
                          {d.state.bancos.length} banco(s) ·{" "}
                          {d.texto ? "gerada" : "em preenchimento"}
                        </span>
                        <span className="text-steel2">
                          criada em {new Date(d.criadoEm).toLocaleString("pt-BR")}
                        </span>
                      </button>
                      <ActionButton onClick={() => setDrafts(duplicarDraft(d.id))}>
                        DUPLICAR
                      </ActionButton>
                      <ActionButton variant="danger" onClick={() => setDrafts(excluirDraft(d.id))}>
                        EXCLUIR
                      </ActionButton>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        <main className="mx-auto grid max-w-[1440px] grid-cols-1 items-start gap-5 px-5 py-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-3">
            {/* 01 — Data e turno */}
            <section className="rounded-xl bg-panel ring-1 ring-line backdrop-blur-md">
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="font-mono text-[10px] text-signal">01</span>
                <span className="text-sm font-semibold text-foreground">Data e Turno</span>
              </div>
              <div className="flex flex-wrap items-end gap-4 px-4 pb-4">
                <div className="w-40">
                  <TextField
                    label="Data"
                    type="date"
                    value={state.data}
                    onChange={(v) => set({ data: v })}
                  />
                </div>
                <div>
                  <Label>Turno</Label>
                  <div className="inline-flex rounded-md bg-panel2 p-0.5 ring-1 ring-line">
                    {TURNOS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => set({ turno: t as Turno })}
                        className={
                          state.turno === t
                            ? "rounded bg-signal px-4 py-1.5 text-sm font-medium text-signal-foreground"
                            : "rounded px-4 py-1.5 text-sm font-medium text-steel hover:text-foreground"
                        }
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 02 — Bancos */}
            <Section
              numero="02"
              titulo="Bancos / Frentes"
              resumo={`${state.bancos.length} selecionados`}
              open={!!abertas["bancos"]}
              onToggle={() => toggleSecao("bancos")}
            >
              <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <SelectField
                  label="Adicionar banco / frente"
                  value=""
                  onChange={(v) => {
                    if (!v || bancosSelecionados.includes(v)) return;
                    set({ bancos: [...state.bancos, novoBanco(v)] });
                  }}
                  options={nomesAtivos.filter((b) => !bancosSelecionados.includes(b))}
                  placeholder="Selecione para adicionar…"
                />
                <div className="flex items-end gap-2">
                  <TextField
                    className="flex-1"
                    label="Outro (nome livre)"
                    value={bancoCustom}
                    onChange={setBancoCustom}
                    placeholder="Ex.: B-1040"
                  />
                  <ActionButton
                    onClick={() => {
                      const nome = bancoCustom.trim();
                      if (!nome || bancosSelecionados.includes(nome)) return;
                      set({ bancos: [...state.bancos, novoBanco(nome)] });
                      setBancoCustom("");
                    }}
                  >
                    ＋ ADICIONAR
                  </ActionButton>
                </div>
              </div>

              {state.bancos.length === 0 ? (
                <p className="text-sm text-steel2">
                  Adicione acima os bancos que participaram do turno — só eles aparecerão aqui.
                </p>
              ) : (
                <div className="space-y-3">
                  {state.bancos.map((banco) => (
                    <BancoCard
                      key={banco.id}
                      banco={banco}
                      onChange={(b) =>
                        set({ bancos: state.bancos.map((x) => (x.id === b.id ? b : x)) })
                      }
                      onRemove={() =>
                        set({ bancos: state.bancos.filter((x) => x.id !== banco.id) })
                      }
                    />
                  ))}
                </div>
              )}
            </Section>

            {/* 03 — Outras observações */}
            <Section
              numero="03"
              titulo="Outras Observações"
              resumo={`${state.observacoes.filter((o) => o.trim()).length} registro(s)`}
              open={!!abertas["obs"]}
              onToggle={() => toggleSecao("obs")}
            >
              <div className="space-y-2">
                {state.observacoes.map((o, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="flex-1">
                      <TextArea
                        value={o}
                        onChange={(v) =>
                          set({
                            observacoes: state.observacoes.map((x, j) => (j === i ? v : x)),
                          })
                        }
                        placeholder="Observação do turno"
                      />
                    </div>
                    <ActionButton
                      variant="danger"
                      onClick={() =>
                        set({ observacoes: state.observacoes.filter((_, j) => j !== i) })
                      }
                    >
                      ✕
                    </ActionButton>
                  </div>
                ))}
                <ActionButton onClick={() => set({ observacoes: [...state.observacoes, ""] })}>
                  ＋ Adicionar observação
                </ActionButton>
                <div>
                  <Label>Sugestões rápidas</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {OBS_TURNO_SUGESTOES.map((s) => (
                      <Chip
                        key={s}
                        size="sm"
                        onClick={() => set({ observacoes: [...state.observacoes, s] })}
                      >
                        + {s}
                      </Chip>
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            {/* 04 — Paradas */}
            <Section
              numero="04"
              titulo="Paradas Operacionais"
              resumo={`${state.paradas.length} registro(s)`}
              open={!!abertas["paradas"]}
              onToggle={() => toggleSecao("paradas")}
            >
              <div className="space-y-3">
                {state.paradas.map((p) => (
                  <div key={p.id} className="rounded-lg bg-panel2/40 p-3 ring-1 ring-line">
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                      <SelectField
                        label="Local"
                        value={p.local}
                        onChange={(v) =>
                          set({
                            paradas: state.paradas.map((x) =>
                              x.id === p.id ? { ...x, local: v } : x,
                            ),
                          })
                        }
                        options={nomesLocaisOperacionais}
                      />
                      <TextField
                        label="Início"
                        type="time"
                        value={p.inicio}
                        onChange={(v) =>
                          set({
                            paradas: state.paradas.map((x) =>
                              x.id === p.id ? { ...x, inicio: v } : x,
                            ),
                          })
                        }
                      />
                      <TextField
                        label="Fim"
                        type="time"
                        value={p.fim}
                        onChange={(v) =>
                          set({
                            paradas: state.paradas.map((x) =>
                              x.id === p.id ? { ...x, fim: v } : x,
                            ),
                          })
                        }
                      />
                      <SelectField
                        label="Motivo"
                        value={p.motivo}
                        onChange={(v) =>
                          set({
                            paradas: state.paradas.map((x) =>
                              x.id === p.id ? { ...x, motivo: v } : x,
                            ),
                          })
                        }
                        options={PARADA_MOTIVOS}
                      />
                      {p.motivo === "Outros" && (
                        <TextField
                          label="Motivo (descreva)"
                          value={p.motivoOutro}
                          onChange={(v) =>
                            set({
                              paradas: state.paradas.map((x) =>
                                x.id === p.id ? { ...x, motivoOutro: v } : x,
                              ),
                            })
                          }
                        />
                      )}
                    </div>
                    <div className="mt-2 flex items-end gap-2">
                      <div className="flex-1">
                        <TextField
                          label="Observação da parada (opcional)"
                          value={p.observacao}
                          onChange={(v) =>
                            set({
                              paradas: state.paradas.map((x) =>
                                x.id === p.id ? { ...x, observacao: v } : x,
                              ),
                            })
                          }
                        />
                      </div>
                      <ActionButton
                        variant="danger"
                        onClick={() => set({ paradas: state.paradas.filter((x) => x.id !== p.id) })}
                      >
                        ✕
                      </ActionButton>
                    </div>
                    {textoParada(p) && (
                      <p className="mt-2 border-l-2 border-signal/40 pl-2 font-mono text-[11px] text-steel">
                        {textoParada(p)}
                      </p>
                    )}
                  </div>
                ))}
                <ActionButton onClick={() => set({ paradas: [...state.paradas, novaParada()] })}>
                  ＋ Adicionar parada
                </ActionButton>
              </div>
            </Section>

            {/* 05 — Outras movimentações */}
            <Section
              numero="05"
              titulo="Outras Movimentações"
              resumo={`${state.movimentacoes.length} registro(s)`}
              open={!!abertas["mov"]}
              onToggle={() => toggleSecao("mov")}
            >
              <MovimentacaoLista
                itens={state.movimentacoes}
                onChange={(itens) => set({ movimentacoes: itens })}
                locais={nomesAtivos}
              />
            </Section>


            <button
              type="button"
              onClick={() => {
                setTexto(gerarJustificativa(state));
                setEditando(false);
              }}
              className="w-full rounded-lg bg-signal py-4 text-base font-semibold tracking-wide text-signal-foreground ring-1 ring-signal/60 transition-[filter] hover:brightness-110"
            >
              GERAR JUSTIFICATIVA
            </button>
          </div>

          {/* PRÉVIA / EDITOR */}
          <aside className="lg:sticky lg:top-5">
            <div className="rounded-xl bg-panel ring-1 ring-line backdrop-blur-md">
              <div className="flex items-center gap-2 border-b border-line px-4 py-3">
                <span className="font-mono text-[10px] uppercase tracking-wide text-steel2">
                  {editando ? "Editor" : texto ? "Justificativa gerada" : "Pré-visualização"}
                </span>
                <span className="ml-auto flex items-center gap-1.5 font-mono text-[11px] text-steel2">
                  <span className="size-1.5 rounded-full bg-ok" />
                  {editando ? "editável" : "ao vivo"}
                </span>
              </div>
              <div className="p-4">
                {editando ? (
                  <textarea
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    rows={26}
                    className="max-h-[62vh] w-full resize-y rounded-md bg-panel2 p-3 font-mono text-[11px] leading-relaxed text-foreground ring-1 ring-line outline-none focus:ring-signal/60"
                  />
                ) : (
                  <pre className="max-h-[62vh] overflow-auto whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-steel">
                    {exibido}
                  </pre>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-3">
                <ActionButton variant="primary" onClick={copiar}>
                  {copiado ? "COPIADO!" : "COPIAR JUSTIFICATIVA"}
                </ActionButton>
                <ActionButton
                  onClick={() => {
                    if (!editando && !texto) setTexto(previa);
                    setEditando((v) => !v);
                  }}
                >
                  {editando ? "CONCLUIR EDIÇÃO" : "EDITAR"}
                </ActionButton>
                <ActionButton
                  onClick={() => {
                    setTexto("");
                    setEditando(false);
                  }}
                >
                  LIMPAR
                </ActionButton>
                <ActionButton className="ml-auto" onClick={novaJustificativa}>
                  NOVA JUSTIFICATIVA
                </ActionButton>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
