import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GripVertical } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ActionButton, Chip, TextArea, TextField } from "@/components/kit";
import {
  atualizarMensagem,
  criarMensagem,
  excluirMensagem,
  reordenarMensagens,
  useMensagens,
  type MensagemT2,
} from "@/lib/mensagens";

export const Route = createFileRoute("/cadastros/mensagens")({
  head: () => ({
    meta: [
      { title: "Cadastro de Mensagens T2 | MineShift" },
      {
        name: "description",
        content:
          "Crie, edite, ative, desative e ordene as mensagens operacionais de comunicação com o T2. A biblioteca é compartilhada entre todos os usuários.",
      },
      { property: "og:title", content: "Cadastro de Mensagens T2 | MineShift" },
      {
        property: "og:description",
        content: "Administre a biblioteca compartilhada de mensagens operacionais do MineShift.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CadastroMensagens,
});

function Linha({
  item,
  onRefresh,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  item: MensagemT2;
  onRefresh: () => Promise<void>;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
}) {
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(item.nome);
  const [mensagem, setMensagem] = useState(item.mensagem);
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
          <TextField label="Nome da mensagem" value={nome} onChange={setNome} />
          <TextArea label="Conteúdo da mensagem" value={mensagem} onChange={setMensagem} rows={4} />
          <div className="flex gap-2">
            <ActionButton
              variant="primary"
              onClick={async () => {
                const n = nome.trim();
                const m = mensagem.trim();
                if (!n || !m) return;
                await atualizarMensagem(item.id, { nome: n, mensagem: m });
                setEditando(false);
                await onRefresh();
              }}
            >
              SALVAR
            </ActionButton>
            <ActionButton
              onClick={() => {
                setNome(item.nome);
                setMensagem(item.mensagem);
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
              className="mt-0.5 size-4 shrink-0 cursor-grab text-steel2"
              strokeWidth={1.75}
            />
            <span
              className={`mt-2 size-2 shrink-0 rounded-full ${item.ativo ? "bg-ok" : "bg-steel2"}`}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">{item.nome}</p>
              <p className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed text-steel2">
                {item.mensagem}
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <ActionButton onClick={() => setEditando(true)}>EDITAR</ActionButton>
            <ActionButton
              onClick={async () => {
                await atualizarMensagem(item.id, { ativo: !item.ativo });
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
                    await excluirMensagem(item.id);
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

function CadastroMensagens() {
  const { mensagens, carregando, erro, recarregar, setMensagens } = useMensagens();
  const [criando, setCriando] = useState(false);
  const [nome, setNome] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [arrastando, setArrastando] = useState<string | null>(null);

  const salvarNova = async () => {
    const n = nome.trim();
    const m = mensagem.trim();
    if (!n || !m) return;
    const maiorOrdem = mensagens.reduce((max, i) => Math.max(max, i.ordem), 0);
    await criarMensagem(n, m, maiorOrdem + 10);
    setNome("");
    setMensagem("");
    setCriando(false);
    await recarregar();
  };

  const soltarSobre = async (destinoId: string) => {
    if (!arrastando || arrastando === destinoId) return;
    const origem = mensagens.findIndex((m) => m.id === arrastando);
    const destino = mensagens.findIndex((m) => m.id === destinoId);
    if (origem < 0 || destino < 0) return;
    const lista = [...mensagens];
    const [movido] = lista.splice(origem, 1);
    if (!movido) return;
    lista.splice(destino, 0, movido);
    setMensagens(lista.map((m, i) => ({ ...m, ordem: (i + 1) * 10 })));
    setArrastando(null);
    await reordenarMensagens(lista.map((m) => m.id));
    await recarregar();
  };

  return (
    <AppShell
      titulo="Mensagens T2"
      subtitulo="Cadastros · biblioteca compartilhada"
      largura="max-w-[900px]"
    >
      <div className="space-y-4">
        <section className="glass-panel p-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="flex-1 text-sm text-steel">
              Gerencie as mensagens operacionais disponíveis no sistema.
            </p>
            <ActionButton variant="primary" onClick={() => setCriando((v) => !v)}>
              ＋ NOVA MENSAGEM
            </ActionButton>
          </div>

          {criando && (
            <div className="mt-4 space-y-2 border-t border-line pt-4">
              <TextField
                label="Nome da mensagem"
                value={nome}
                onChange={setNome}
                placeholder="Ex.: Abastecimento da EH"
              />
              <TextArea
                label="Conteúdo da mensagem"
                value={mensagem}
                onChange={setMensagem}
                rows={4}
                placeholder="Ex.: Abastecimento da EH008 e limpeza dos tambores de retorno PN01 e PN02."
              />
              <div className="flex gap-2">
                <ActionButton
                  onClick={() => {
                    setCriando(false);
                    setNome("");
                    setMensagem("");
                  }}
                >
                  CANCELAR
                </ActionButton>
                <ActionButton variant="primary" onClick={() => void salvarNova()}>
                  SALVAR MENSAGEM
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
        {carregando && <p className="text-sm text-steel2">Carregando mensagens…</p>}

        <section className="glass-panel p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-[15px] font-semibold text-foreground">Mensagens</span>
            <Chip>{mensagens.length}</Chip>
            <span className="ml-auto font-mono text-[10px] uppercase tracking-wide text-steel2">
              arraste para reordenar
            </span>
          </div>
          {!carregando && mensagens.length === 0 ? (
            <p className="py-4 text-center text-sm text-steel2">
              Nenhuma mensagem cadastrada. Use “Nova mensagem”.
            </p>
          ) : (
            <ul className="space-y-2">
              {mensagens.map((m) => (
                <Linha
                  key={m.id}
                  item={m}
                  onRefresh={recarregar}
                  onDragStart={() => setArrastando(m.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => void soltarSobre(m.id)}
                />
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}
