import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock, GripVertical, User } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ActionButton, Label, SelectField, TextArea, TextField } from "@/components/kit";
import { ImagensT2 } from "@/components/ImagensT2";
import { useAuth, listarPerfis, type Perfil } from "@/lib/auth";
import {
  excluirJustificativa,
  formatarDataBR,
  gravarOrdem,
  ordemCronologica,
  salvarJustificativa,
  turnoLabel,
  useJustificativas,
  type ImagemT2,
  type Justificativa,
  type TurnoRegistro,
} from "@/lib/blendRegistros";
import { baixarRelatorio, urlPreviaRelatorio } from "@/lib/relatorioPdf";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/relatorios/blend")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Relatório de Blend | Consolidação das justificativas" },
      {
        name: "description",
        content:
          "Consulte, edite, organize e gere o PDF consolidado das justificativas de movimentações e Blend por período e turno.",
      },
      { property: "og:title", content: "Relatório de Blend | MineShift" },
      {
        property: "og:description",
        content: "Gerencie as justificativas dos turnos e gere o relatório consolidado em PDF.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RelatorioBlend,
});

interface EdicaoState {
  id?: string;
  data: string;
  turno: TurnoRegistro;
  texto: string;
  userId: string | null;
  autorNome: string;
  imagens: ImagemT2[];
  removidas: Array<{ id: string; storage_path: string }>;
}

const hoje = () => new Date().toISOString().slice(0, 10);

function RelatorioBlend() {
  const { perfil, autenticado, carregando: carregandoAuth } = useAuth();
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");
  const [turno, setTurno] = useState<"" | TurnoRegistro>("");
  const [usuarioFiltro, setUsuarioFiltro] = useState("");
  const [filtro, setFiltro] = useState<{
    de?: string;
    ate?: string;
    turno?: "" | TurnoRegistro;
    userId?: string;
  }>({});

  const { registros, setRegistros, carregando, erro, recarregar } = useJustificativas(filtro);
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [expandida, setExpandida] = useState<string | null>(null);
  const [selecionadas, setSelecionadas] = useState<Record<string, boolean>>({});
  const [edicao, setEdicao] = useState<EdicaoState | null>(null);
  const [confirmando, setConfirmando] = useState<Justificativa | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [previa, setPrevia] = useState<string | null>(null);
  const [arrastando, setArrastando] = useState<number | null>(null);

  useEffect(() => {
    if (!autenticado) return;
    void listarPerfis()
      .then(setPerfis)
      .catch(() => setPerfis([]));
  }, [autenticado]);

  useEffect(() => {
    setSelecionadas((s) => {
      const proximo: Record<string, boolean> = {};
      for (const r of registros) proximo[r.id] = s[r.id] ?? true;
      return proximo;
    });
  }, [registros]);

  const selecionados = useMemo(
    () => registros.filter((r) => selecionadas[r.id]),
    [registros, selecionadas],
  );

  const aplicarFiltro = () =>
    setFiltro({
      de: de || undefined,
      ate: ate || undefined,
      turno: turno || "",
      userId: usuarioFiltro || undefined,
    });

  const limparFiltros = () => {
    setDe("");
    setAte("");
    setTurno("");
    setUsuarioFiltro("");
    setFiltro({});
  };

  const abrirNova = () =>
    setEdicao({
      data: hoje(),
      turno: "1°",
      texto: "",
      userId: perfil?.id ?? null,
      autorNome: perfil?.full_name ?? "",
      imagens: [],
      removidas: [],
    });

  const abrirEdicao = (j: Justificativa) =>
    setEdicao({
      id: j.id,
      data: j.data,
      turno: j.turno,
      texto: j.texto,
      userId: j.user_id,
      autorNome: j.autor_nome,
      imagens: j.imagens,
      removidas: [],
    });

  const salvar = async () => {
    if (!edicao) return;
    if (!edicao.id && edicao.imagens.length === 0) {
      setMensagem("Anexe ao menos uma imagem do controle T2.");
      return;
    }
    try {
      await salvarJustificativa({
        id: edicao.id,
        data: edicao.data,
        turno: edicao.turno,
        texto: edicao.texto,
        userId: edicao.userId,
        autorNome: edicao.autorNome || perfil?.full_name || "",
        imagens: edicao.imagens,
        imagensRemovidas: edicao.removidas,
      });
      setEdicao(null);
      setMensagem("Justificativa salva.");
      await recarregar();
    } catch (e) {
      setMensagem(e instanceof Error ? e.message : "Falha ao salvar.");
    }
  };

  const excluir = async () => {
    if (!confirmando) return;
    try {
      await excluirJustificativa(confirmando);
      setConfirmando(null);
      await recarregar();
    } catch (e) {
      setMensagem(e instanceof Error ? e.message : "Falha ao excluir.");
    }
  };

  const restaurarCronologica = async () => {
    const ordenados = [...registros].sort(ordemCronologica);
    setRegistros(ordenados);
    await gravarOrdem(ordenados);
    setMensagem("Ordem cronológica restaurada.");
  };

  const soltarEm = async (destino: number) => {
    if (arrastando === null || arrastando === destino) return;
    const lista = [...registros];
    const [movido] = lista.splice(arrastando, 1);
    if (movido) lista.splice(destino, 0, movido);
    setArrastando(null);
    setRegistros(lista);
    await gravarOrdem(lista);
  };

  const abrirPrevia = async () => {
    if (selecionados.length === 0) {
      setMensagem("Selecione ao menos uma justificativa.");
      return;
    }
    setMensagem("Montando o relatório…");
    const url = await urlPreviaRelatorio(selecionados, { periodoDe: de, periodoAte: ate });
    setPrevia(url);
    setMensagem(null);
  };

  if (!carregandoAuth && !autenticado) {
    return (
      <AppShell titulo="Relatório de Blend" subtitulo="Acesso restrito" largura="max-w-[520px]">
        <div className="glass-panel px-5 py-8 text-center">
          <p className="text-sm text-steel">Entre com seu usuário para acessar o relatório.</p>
          <Link
            to="/auth"
            className="mt-4 inline-block rounded-md bg-signal px-4 py-2 text-xs font-semibold text-signal-foreground"
          >
            IR PARA O ACESSO
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      titulo="Relatório de Blend"
      subtitulo="Gerencie as justificativas dos turnos e gere o relatório consolidado"
      acoes={
        <>
          <ActionButton onClick={abrirNova}>＋ ADICIONAR JUSTIFICATIVA</ActionButton>
          <ActionButton variant="primary" onClick={() => void abrirPrevia()}>
            GERAR PDF
          </ActionButton>
        </>
      }
    >
      <div className="space-y-4">
        {/* Filtros */}
        <section className="glass-panel px-4 py-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <TextField label="Período inicial" type="date" value={de} onChange={setDe} />
            <TextField label="Período final" type="date" value={ate} onChange={setAte} />
            <div>
              <Label>Turno</Label>
              <select
                value={turno}
                onChange={(e) => setTurno(e.target.value as "" | TurnoRegistro)}
                className="w-full rounded-md bg-panel2 px-3 py-2 text-sm text-foreground ring-1 ring-line outline-none focus:ring-signal/60"
              >
                <option value="">Todos</option>
                <option value="1°">1º Turno</option>
                <option value="2°">2º Turno</option>
              </select>
            </div>
            <div>
              <Label>Usuário</Label>
              <select
                value={usuarioFiltro}
                onChange={(e) => setUsuarioFiltro(e.target.value)}
                className="w-full rounded-md bg-panel2 px-3 py-2 text-sm text-foreground ring-1 ring-line outline-none focus:ring-signal/60"
              >
                <option value="">Todos</option>
                {perfis.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <ActionButton variant="primary" onClick={aplicarFiltro}>
              FILTRAR
            </ActionButton>
            <ActionButton onClick={limparFiltros}>LIMPAR FILTROS</ActionButton>
            <ActionButton onClick={() => void restaurarCronologica()}>
              RESTAURAR ORDEM CRONOLÓGICA
            </ActionButton>
            <ActionButton
              onClick={() =>
                setSelecionadas(Object.fromEntries(registros.map((r) => [r.id, true])))
              }
            >
              SELECIONAR TODOS
            </ActionButton>
            <ActionButton onClick={() => setSelecionadas({})}>DESMARCAR TODOS</ActionButton>
          </div>
        </section>

        {mensagem && (
          <p className="glass-panel px-4 py-2 font-mono text-[11px] text-steel">{mensagem}</p>
        )}
        {erro && (
          <p className="rounded-lg bg-danger/10 px-3 py-2 font-mono text-[11px] text-danger">
            {erro}
          </p>
        )}
        {carregando && <p className="text-sm text-steel2">Carregando justificativas…</p>}

        {!carregando && registros.length === 0 && (
          <p className="glass-panel px-4 py-8 text-center text-sm text-steel2">
            Nenhuma justificativa registrada para os filtros selecionados.
          </p>
        )}

        {/* Lista */}
        <ul className="space-y-2">
          {registros.map((j, i) => {
            const aberta = expandida === j.id;
            return (
              <li
                key={j.id}
                draggable
                onDragStart={() => setArrastando(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => void soltarEm(i)}
                className={cn("glass-panel", arrastando === i && "opacity-60")}
              >
                <div className="flex flex-wrap items-center gap-3 px-3 py-3">
                  <GripVertical
                    aria-hidden="true"
                    className="size-4 shrink-0 cursor-grab text-steel2"
                    strokeWidth={1.75}
                  />
                  <input
                    type="checkbox"
                    checked={!!selecionadas[j.id]}
                    onChange={(e) =>
                      setSelecionadas((s) => ({ ...s, [j.id]: e.target.checked }))
                    }
                    aria-label={`Incluir ${formatarDataBR(j.data)} ${turnoLabel(j.turno)} no PDF`}
                    className="size-4 accent-[oklch(0.75_0.15_155)]"
                  />
                  <button
                    type="button"
                    onClick={() => setExpandida(aberta ? null : j.id)}
                    className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-1 text-left"
                  >
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                      <CalendarDays aria-hidden="true" className="size-4" strokeWidth={1.75} />
                      {formatarDataBR(j.data)}
                    </span>
                    <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase text-signal">
                      <Clock aria-hidden="true" className="size-3.5" strokeWidth={1.75} />
                      {turnoLabel(j.turno)}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-steel">
                      <User aria-hidden="true" className="size-3.5" strokeWidth={1.75} />
                      {j.autor_nome || "não informado"}
                    </span>
                    {j.imagens.length === 0 && (
                      <span className="font-mono text-[10px] uppercase text-danger">
                        sem imagem
                      </span>
                    )}
                    <span
                      className={cn(
                        "ml-auto text-steel2 transition-transform",
                        !aberta && "-rotate-90",
                      )}
                    >
                      ▾
                    </span>
                  </button>
                </div>

                {aberta && (
                  <div className="border-t border-line px-4 py-4">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <Info titulo="Data" valor={formatarDataBR(j.data)} />
                      <Info titulo="Turno" valor={turnoLabel(j.turno)} />
                      <Info titulo="Criada em" valor={new Date(j.created_at).toLocaleString("pt-BR")} />
                      <Info
                        titulo="Última alteração"
                        valor={new Date(j.updated_at).toLocaleString("pt-BR")}
                      />
                    </div>

                    <p className="mt-4 font-mono text-[10px] uppercase tracking-wide text-steel2">
                      Texto completo
                    </p>
                    <pre className="mt-1 max-h-[40vh] overflow-auto whitespace-pre-wrap rounded-md bg-panel2/50 p-3 font-mono text-[11px] leading-relaxed text-steel">
                      {j.texto}
                    </pre>

                    <p className="mt-4 font-mono text-[10px] uppercase tracking-wide text-steel2">
                      Imagens do T2
                    </p>
                    {j.imagens.length === 0 ? (
                      <p className="mt-1 text-sm text-steel2">
                        Imagem ausente — edite a justificativa para anexar.
                      </p>
                    ) : (
                      <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {j.imagens.map((img, k) => (
                          <li key={img.id ?? k}>
                            <a href={img.url} target="_blank" rel="noreferrer">
                              <img
                                src={img.url}
                                alt={`Controle T2 ${k + 1} de ${formatarDataBR(j.data)}`}
                                className="h-32 w-full rounded-md object-cover ring-1 ring-line"
                              />
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <ActionButton variant="primary" onClick={() => abrirEdicao(j)}>
                        EDITAR
                      </ActionButton>
                      <ActionButton variant="danger" onClick={() => setConfirmando(j)}>
                        EXCLUIR
                      </ActionButton>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Edição / novo registro */}
      {edicao && (
        <Modal titulo={edicao.id ? "Editar justificativa" : "Adicionar justificativa"}>
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <TextField
                label="Data"
                type="date"
                value={edicao.data}
                onChange={(v) => setEdicao({ ...edicao, data: v })}
              />
              <div>
                <Label>Turno</Label>
                <select
                  value={edicao.turno}
                  onChange={(e) =>
                    setEdicao({ ...edicao, turno: e.target.value as TurnoRegistro })
                  }
                  className="w-full rounded-md bg-panel2 px-3 py-2 text-sm text-foreground ring-1 ring-line outline-none focus:ring-signal/60"
                >
                  <option value="1°">1º Turno</option>
                  <option value="2°">2º Turno</option>
                </select>
              </div>
              <SelectField
                label="Usuário responsável"
                value={edicao.userId ?? ""}
                onChange={(v) => {
                  const p = perfis.find((x) => x.id === v);
                  setEdicao({ ...edicao, userId: v || null, autorNome: p?.full_name ?? "" });
                }}
                options={perfis.map((p) => p.id)}
                placeholder={edicao.autorNome || "Selecione…"}
              />
            </div>
            <p className="font-mono text-[10px] uppercase text-steel2">
              Responsável: {edicao.autorNome || "não informado"}
            </p>
            <TextArea
              label="Texto da justificativa"
              value={edicao.texto}
              onChange={(v) => setEdicao({ ...edicao, texto: v })}
              rows={14}
            />
            <ImagensT2
              imagens={edicao.imagens}
              onChange={(imgs) => setEdicao({ ...edicao, imagens: imgs })}
              onRemoverSalva={(img) =>
                setEdicao((s) => (s ? { ...s, removidas: [...s.removidas, img] } : s))
              }
            />
            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <ActionButton onClick={() => setEdicao(null)}>CANCELAR</ActionButton>
              <ActionButton variant="primary" onClick={() => void salvar()}>
                SALVAR
              </ActionButton>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmação de exclusão */}
      {confirmando && (
        <Modal titulo="Excluir justificativa">
          <p className="text-sm text-steel">
            Deseja realmente excluir a justificativa de {formatarDataBR(confirmando.data)} —{" "}
            {turnoLabel(confirmando.turno)}? As imagens vinculadas também serão removidas.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <ActionButton onClick={() => setConfirmando(null)}>CANCELAR</ActionButton>
            <ActionButton variant="danger" onClick={() => void excluir()}>
              EXCLUIR
            </ActionButton>
          </div>
        </Modal>
      )}

      {/* Pré-visualização do PDF */}
      {previa && (
        <Modal titulo="Visualizar relatório" largo>
          <iframe
            title="Pré-visualização do relatório"
            src={previa}
            className="h-[65vh] w-full rounded-md bg-white ring-1 ring-line"
          />
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <ActionButton onClick={() => setPrevia(null)}>VOLTAR</ActionButton>
            <ActionButton
              variant="primary"
              onClick={() =>
                void baixarRelatorio(selecionados, { periodoDe: de, periodoAte: ate })
              }
            >
              BAIXAR PDF
            </ActionButton>
          </div>
        </Modal>
      )}
    </AppShell>
  );
}

function Info({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-wide text-steel2">{titulo}</p>
      <p className="text-sm text-foreground">{valor}</p>
    </div>
  );
}

function Modal({
  titulo,
  children,
  largo,
}: {
  titulo: string;
  children: React.ReactNode;
  largo?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-shell/70 p-4 backdrop-blur-sm">
      <div
        className={cn(
          "glass-panel my-6 w-full px-5 py-5",
          largo ? "max-w-[900px]" : "max-w-[720px]",
        )}
      >
        <h2 className="mb-4 text-sm font-semibold text-foreground">{titulo}</h2>
        {children}
      </div>
    </div>
  );
}
