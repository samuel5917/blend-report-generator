import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  atualizarLocal,
  criarLocal,
  excluirLocal,
  trocarOrdem,
  useLocais,
  type Local,
  type LocalTipo,
} from "@/lib/locais";
import { ActionButton, Chip, Label, SelectField, TextField } from "@/components/kit";

export const Route = createFileRoute("/cadastros/bancos")({
  head: () => ({
    meta: [
      { title: "Cadastro de Bancos e Locais | MineShift" },
      {
        name: "description",
        content:
          "Cadastre, edite, ative, desative e ordene os bancos e locais operacionais usados na Justificativa do Blend. O cadastro é compartilhado entre todos os usuários.",
      },
      { property: "og:title", content: "Cadastro de Bancos e Locais | MineShift" },
      {
        property: "og:description",
        content:
          "Fonte única dos bancos e locais operacionais usados em toda a Justificativa do Blend.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CadastroBancos,
});

function Linha({
  item,
  primeiro,
  ultimo,
  onRefresh,
  onMover,
}: {
  item: Local;
  primeiro: boolean;
  ultimo: boolean;
  onRefresh: () => Promise<void>;
  onMover: (dir: -1 | 1) => void;
}) {
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(item.nome);
  const [confirmar, setConfirmar] = useState(false);

  return (
    <li className="flex flex-wrap items-center gap-2 rounded-lg bg-panel2/40 px-3 py-2 ring-1 ring-line">
      <span
        className={`size-2 shrink-0 rounded-full ${item.ativo ? "bg-ok" : "bg-steel2"}`}
        aria-hidden="true"
      />
      {editando ? (
        <div className="flex flex-1 items-end gap-2">
          <TextField className="flex-1" value={nome} onChange={setNome} />
          <ActionButton
            variant="primary"
            onClick={async () => {
              const novo = nome.trim();
              if (novo) await atualizarLocal(item.id, { nome: novo });
              setEditando(false);
              await onRefresh();
            }}
          >
            SALVAR
          </ActionButton>
          <ActionButton
            onClick={() => {
              setNome(item.nome);
              setEditando(false);
            }}
          >
            CANCELAR
          </ActionButton>
        </div>
      ) : (
        <>
          <span className="flex-1 font-mono text-sm text-foreground">{item.nome}</span>
          <span className="font-mono text-[10px] uppercase tracking-wide text-steel2">
            {item.tipo === "banco" ? "banco" : "local operacional"}
          </span>
          <ActionButton onClick={() => setEditando(true)}>EDITAR</ActionButton>
          <ActionButton
            onClick={async () => {
              await atualizarLocal(item.id, { ativo: !item.ativo });
              await onRefresh();
            }}
          >
            {item.ativo ? "DESATIVAR" : "REATIVAR"}
          </ActionButton>
          {confirmar ? (
            <>
              <ActionButton
                variant="danger"
                onClick={async () => {
                  await excluirLocal(item.id);
                  setConfirmar(false);
                  await onRefresh();
                }}
              >
                CONFIRMAR EXCLUSÃO
              </ActionButton>
              <ActionButton onClick={() => setConfirmar(false)}>NÃO</ActionButton>
            </>
          ) : (
            <ActionButton variant="danger" onClick={() => setConfirmar(true)}>
              EXCLUIR
            </ActionButton>
          )}
        </>
      )}
      <span className="flex gap-1">
        <ActionButton onClick={() => onMover(-1)} className={primeiro ? "opacity-30" : ""}>
          ↑
        </ActionButton>
        <ActionButton onClick={() => onMover(1)} className={ultimo ? "opacity-30" : ""}>
          ↓
        </ActionButton>
      </span>
    </li>
  );
}

function CadastroBancos() {
  const { locais, carregando, erro, recarregar } = useLocais();
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<LocalTipo>("banco");

  const mover = async (id: string, dir: -1 | 1) => {
    const i = locais.findIndex((l) => l.id === id);
    const atual = locais[i];
    const vizinho = locais[i + dir];
    if (!atual || !vizinho) return;
    await trocarOrdem(atual, vizinho);
    await recarregar();
  };

  const bancos = locais.filter((l) => l.tipo === "banco");
  const operacionais = locais.filter((l) => l.tipo === "local");

  const adicionar = async () => {
    const n = nome.trim();
    if (!n) return;
    const maiorOrdem = locais.reduce((max, l) => Math.max(max, l.ordem), 0);
    await criarLocal(n, tipo, maiorOrdem + 10);
    setNome("");
    await recarregar();
  };

  const listar = (itens: Local[]) => (
    <ul className="space-y-2">
      {itens.map((item) => {
        const i = locais.findIndex((l) => l.id === item.id);
        return (
          <Linha
            key={item.id}
            item={item}
            primeiro={i === 0}
            ultimo={i === locais.length - 1}
            onRefresh={recarregar}
            onMover={(dir) => void mover(item.id, dir)}
          />
        );
      })}
    </ul>
  );

  return (
    <AppShell
      titulo="Cadastro de Bancos"
      subtitulo="Cadastros · compartilhado entre todos os usuários"
      largura="max-w-[900px]"
    >
      <div className="space-y-4">
        <section className="glass-panel p-4">
          <Label>Adicionar</Label>
          <div className="flex flex-wrap items-end gap-2">
            <TextField
              className="min-w-48 flex-1"
              label="Nome"
              value={nome}
              onChange={setNome}
              placeholder="Ex.: B-1140"
            />
            <div className="w-52">
              <SelectField
                label="Tipo"
                value={tipo}
                onChange={(v) => setTipo(v === "local" ? "local" : "banco")}
                options={["banco", "local"]}
                placeholder="banco"
              />
            </div>
            <ActionButton variant="primary" onClick={() => void adicionar()}>
              ＋ ADICIONAR
            </ActionButton>
          </div>
          <p className="mt-2 font-mono text-[11px] text-steel2">
            Use “local” para Planta e Pulmão; “banco” para os bancos/frentes.
          </p>
        </section>

        {erro && (
          <p className="rounded-lg bg-danger/10 px-3 py-2 font-mono text-[11px] text-danger">
            {erro}
          </p>
        )}
        {carregando && <p className="text-sm text-steel2">Carregando cadastro…</p>}

        <section className="glass-panel p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-[15px] font-semibold text-foreground">Bancos</span>
            <Chip>{bancos.length}</Chip>
          </div>
          {listar(bancos)}
        </section>

        <section className="glass-panel p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-[15px] font-semibold text-foreground">Locais operacionais</span>
            <Chip>{operacionais.length}</Chip>
          </div>
          {listar(operacionais)}
        </section>
      </div>
    </AppShell>
  );
}
