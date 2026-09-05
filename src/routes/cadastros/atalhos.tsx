import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GripVertical } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ActionButton, Chip, TextArea, TextField } from "@/components/kit";
import { IconeAtalho } from "@/components/AtalhoCard";
import {
  atualizarAtalho,
  criarAtalho,
  excluirAtalho,
  faviconDaUrl,
  lerIconePersonalizado,
  reordenarAtalhos,
  useAtalhos,
  type AtalhoCCO,
} from "@/lib/atalhos";

export const Route = createFileRoute("/cadastros/atalhos")({
  head: () => ({
    meta: [
      { title: "Cadastro de Atalhos do CCO | MineShift" },
      {
        name: "description",
        content:
          "Cadastre, edite, ative, desative e ordene os sites e sistemas do CCO exibidos no Dashboard do MineShift.",
      },
      { property: "og:title", content: "Cadastro de Atalhos do CCO | MineShift" },
      {
        property: "og:description",
        content: "Administre os atalhos dos sistemas utilizados pelo CCO durante o turno.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CadastroAtalhos,
});

function CampoIcone({
  nome,
  urlSite,
  iconeAuto,
  iconePersonalizado,
  onAuto,
  onPersonalizado,
}: {
  nome: string;
  urlSite: string;
  iconeAuto: string;
  iconePersonalizado: string;
  onAuto: (v: string) => void;
  onPersonalizado: (v: string) => void;
}) {
  const [erro, setErro] = useState<string | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [status, setStatus] = useState<"" | "ok" | "falhou">("");
  const buscar = useServerFn(descobrirIcone);

  const buscarIcone = async () => {
    if (!urlSite.trim()) return;
    setBuscando(true);
    setErro(null);
    try {
      const r = await buscar({ data: { url: urlSite } });
      if (r.dataUrl) {
        onAuto(r.dataUrl);
        onPersonalizado("");
        setStatus("ok");
      } else {
        setStatus("falhou");
      }
    } catch {
      setStatus("falhou");
    } finally {
      setBuscando(false);
    }
  };

  return (
    <div>
      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-wide text-steel2">
        Ícone do sistema
      </span>
      <div className="flex flex-wrap items-center gap-3">
        <IconeAtalho
          atalho={{ nome, icone_url: iconeAuto, icone_personalizado: iconePersonalizado }}
          tamanho={40}
        />
        <ActionButton onClick={buscarIcone} disabled={buscando || !urlSite.trim()}>
          {buscando ? (
            <span className="inline-flex items-center gap-1.5">
              <Loader2 className="size-3.5 animate-spin" strokeWidth={2} /> BUSCANDO…
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <Search className="size-3.5" strokeWidth={1.75} /> BUSCAR AUTOMATICAMENTE
            </span>
          )}
        </ActionButton>
        <label className="cursor-pointer rounded-md px-3 py-2 text-xs font-semibold tracking-wide text-steel ring-1 ring-line transition-colors hover:text-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Upload className="size-3.5" strokeWidth={1.75} /> ENVIAR ÍCONE
          </span>
          <input
            type="file"
            accept=".ico,.png,.svg,image/x-icon,image/vnd.microsoft.icon,image/png,image/svg+xml"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              try {
                onPersonalizado(await lerIconePersonalizado(file));
                setErro(null);
                setStatus("ok");
              } catch (err) {
                setErro(err instanceof Error ? err.message : "Falha ao ler o ícone.");
              }
            }}
          />
        </label>
        {iconePersonalizado ? (
          <ActionButton onClick={() => onPersonalizado("")}>REMOVER ÍCONE ENVIADO</ActionButton>
        ) : null}
      </div>
      {iconePersonalizado ? (
        <p className="mt-2 font-mono text-[11px] text-ok">Usando o ícone enviado por você.</p>
      ) : status === "ok" && iconeAuto ? (
        <p className="mt-2 font-mono text-[11px] text-ok">Ícone encontrado e salvo no cadastro.</p>
      ) : status === "falhou" ? (
        <p className="mt-2 font-mono text-[11px] text-steel2">
          ⚠ Não foi possível encontrar automaticamente. Você pode enviar um ícone personalizado.
        </p>
      ) : (
        <p className="mt-2 font-mono text-[11px] text-steel2">
          O ícone é buscado no site e salvo aqui; o Dashboard usa sempre a cópia salva.
        </p>
      )}
      {erro ? <p className="mt-2 font-mono text-[11px] text-danger">{erro}</p> : null}
    </div>
  );
}

function Linha({
  item,
  onRefresh,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  item: AtalhoCCO;
  onRefresh: () => Promise<void>;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
}) {
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(item.nome);
  const [url, setUrl] = useState(item.url);
  const [descricao, setDescricao] = useState(item.descricao);
  const [icone, setIcone] = useState(item.icone_personalizado);
  const [confirmar, setConfirmar] = useState(false);

  return (
    <li
      draggable={!editando}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="rounded-lg bg-panel2/40 px-3 py-3 ring-1 ring-line"
    >
      {editando ? (
        <div className="space-y-2">
          <TextField label="Nome" value={nome} onChange={setNome} />
          <TextField label="URL" value={url} onChange={setUrl} />
          <TextArea label="Descrição (opcional)" value={descricao} onChange={setDescricao} rows={2} />
          <CampoIcone valor={icone} onChange={setIcone} urlSite={url} />
          <div className="flex gap-2">
            <ActionButton
              variant="primary"
              onClick={async () => {
                const n = nome.trim();
                const u = url.trim();
                if (!n || !u) return;
                await atualizarAtalho(item.id, {
                  nome: n,
                  url: u,
                  descricao: descricao.trim(),
                  icone_personalizado: icone,
                });
                setEditando(false);
                await onRefresh();
              }}
            >
              SALVAR
            </ActionButton>
            <ActionButton
              onClick={() => {
                setNome(item.nome);
                setUrl(item.url);
                setDescricao(item.descricao);
                setIcone(item.icone_personalizado);
                setEditando(false);
              }}
            >
              CANCELAR
            </ActionButton>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-2">
            <GripVertical
              aria-hidden="true"
              className="mt-2 size-4 shrink-0 cursor-grab text-steel2"
              strokeWidth={1.75}
            />
            <span
              className={`mt-3 size-2 shrink-0 rounded-full ${item.ativo ? "bg-ok" : "bg-steel2"}`}
              aria-hidden="true"
            />
            <IconeAtalho atalho={item} tamanho={36} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">{item.nome}</p>
              <p className="truncate font-mono text-[11px] text-steel2">{item.url}</p>
              {item.descricao ? (
                <p className="mt-1 text-[13px] leading-relaxed text-steel2">{item.descricao}</p>
              ) : null}
            </div>
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-steel2">
              ordem {item.ordem}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <ActionButton onClick={() => setEditando(true)}>EDITAR</ActionButton>
            <ActionButton
              onClick={async () => {
                await atualizarAtalho(item.id, { ativo: !item.ativo });
                await onRefresh();
              }}
            >
              {item.ativo ? "DESATIVAR" : "REATIVAR"}
            </ActionButton>
            {confirmar ? (
              <>
                <span className="self-center font-mono text-[11px] text-steel2">
                  Excluir “{item.nome}”?
                </span>
                <ActionButton
                  variant="danger"
                  onClick={async () => {
                    await excluirAtalho(item.id);
                    setConfirmar(false);
                    await onRefresh();
                  }}
                >
                  CONFIRMAR EXCLUSÃO
                </ActionButton>
                <ActionButton onClick={() => setConfirmar(false)}>CANCELAR</ActionButton>
              </>
            ) : (
              <ActionButton variant="danger" onClick={() => setConfirmar(true)}>
                EXCLUIR
              </ActionButton>
            )}
          </div>
        </>
      )}
    </li>
  );
}

function CadastroAtalhos() {
  const { atalhos, carregando, erro, recarregar, setAtalhos } = useAtalhos();
  const [criando, setCriando] = useState(false);
  const [nome, setNome] = useState("");
  const [url, setUrl] = useState("");
  const [descricao, setDescricao] = useState("");
  const [icone, setIcone] = useState("");
  const [arrastando, setArrastando] = useState<string | null>(null);

  const limpar = () => {
    setNome("");
    setUrl("");
    setDescricao("");
    setIcone("");
  };

  const salvarNovo = async () => {
    const n = nome.trim();
    const u = url.trim();
    if (!n || !u) return;
    const maiorOrdem = atalhos.reduce((max, a) => Math.max(max, a.ordem), 0);
    await criarAtalho({
      nome: n,
      url: u,
      descricao: descricao.trim(),
      icone_url: "",
      icone_personalizado: icone,
      ordem: maiorOrdem + 10,
    });
    limpar();
    setCriando(false);
    await recarregar();
  };

  const soltarSobre = async (destinoId: string) => {
    if (!arrastando || arrastando === destinoId) return;
    const origem = atalhos.findIndex((a) => a.id === arrastando);
    const destino = atalhos.findIndex((a) => a.id === destinoId);
    if (origem < 0 || destino < 0) return;
    const lista = [...atalhos];
    const [movido] = lista.splice(origem, 1);
    if (!movido) return;
    lista.splice(destino, 0, movido);
    setAtalhos(lista.map((a, i) => ({ ...a, ordem: (i + 1) * 10 })));
    setArrastando(null);
    await reordenarAtalhos(lista.map((a) => a.id));
    await recarregar();
  };

  return (
    <AppShell
      titulo="Atalhos do CCO"
      subtitulo="Cadastros · sistemas do Dashboard"
      largura="max-w-[900px]"
    >
      <div className="space-y-4">
        <section className="glass-panel p-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="flex-1 text-sm text-steel">
              Cadastre os sites e sistemas usados no turno. Eles aparecem no Dashboard na ordem
              definida aqui.
            </p>
            <ActionButton variant="primary" onClick={() => setCriando((v) => !v)}>
              ＋ NOVO ATALHO
            </ActionButton>
          </div>

          {criando && (
            <div className="mt-4 space-y-2 border-t border-line pt-4">
              <TextField label="Nome" value={nome} onChange={setNome} placeholder="Ex.: T2" />
              <TextField
                label="URL"
                value={url}
                onChange={setUrl}
                placeholder="Ex.: https://t2.exemplo.com"
              />
              <TextArea
                label="Descrição (opcional)"
                value={descricao}
                onChange={setDescricao}
                rows={2}
                placeholder="Ex.: Acompanhamento das viagens e qualidade"
              />
              <CampoIcone valor={icone} onChange={setIcone} urlSite={url} />
              <div className="flex gap-2 pt-1">
                <ActionButton
                  onClick={() => {
                    setCriando(false);
                    limpar();
                  }}
                >
                  CANCELAR
                </ActionButton>
                <ActionButton variant="primary" onClick={() => void salvarNovo()}>
                  SALVAR ATALHO
                </ActionButton>
              </div>
            </div>
          )}
        </section>

        {erro && (
          <p className="rounded-lg bg-danger/10 px-3 py-2 font-mono text-[11px] text-danger">
            {erro}
          </p>
        )}
        {carregando && <p className="text-sm text-steel2">Carregando atalhos…</p>}

        <section className="glass-panel p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-[15px] font-semibold text-foreground">Atalhos</span>
            <Chip>{atalhos.length}</Chip>
            <span className="ml-auto font-mono text-[10px] uppercase tracking-wide text-steel2">
              arraste para reordenar
            </span>
          </div>
          {!carregando && atalhos.length === 0 ? (
            <p className="py-4 text-center text-sm text-steel2">
              Nenhum atalho cadastrado. Use “Novo atalho”.
            </p>
          ) : (
            <ul className="space-y-2">
              {atalhos.map((a) => (
                <Linha
                  key={a.id}
                  item={a}
                  onRefresh={recarregar}
                  onDragStart={() => setArrastando(a.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => void soltarSobre(a.id)}
                />
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}
