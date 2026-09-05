import {
  MOVIMENTACAO_TIPOS,
  novaMovimentacao,
  type MovimentacaoItem,
  type MovimentacaoTipo,
} from "@/config/blend";
import { textoMovimentacao } from "@/lib/justificativa";
import { ActionButton, SelectField, TextField } from "@/components/kit";

export function MovimentacaoLista({
  itens,
  onChange,
  locais,
}: {
  itens: MovimentacaoItem[];
  onChange: (itens: MovimentacaoItem[]) => void;
  locais: readonly string[];
}) {
  const patch = (id: string, p: Partial<MovimentacaoItem>) =>
    onChange(itens.map((m) => (m.id === id ? { ...m, ...p } : m)));

  return (
    <div className="space-y-3">
      {itens.length === 0 && (
        <p className="text-sm text-steel2">
          Nenhuma movimentação registrada — o texto sairá como “Não houve”. Adicione quantas
          movimentações forem necessárias, inclusive várias do mesmo tipo.
        </p>
      )}

      {itens.map((m, i) => (
        <div key={m.id} className="rounded-lg bg-panel2/40 p-3 ring-1 ring-line">
          <div className="mb-2 flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wide text-steel2">
              Movimentação {i + 1}
            </span>
            <ActionButton
              variant="danger"
              className="ml-auto"
              onClick={() => onChange(itens.filter((x) => x.id !== m.id))}
            >
              ✕
            </ActionButton>
          </div>

          <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
            <SelectField
              label="Tipo"
              value={m.tipo}
              onChange={(v) => patch(m.id, { tipo: v as MovimentacaoTipo })}
              options={MOVIMENTACAO_TIPOS}
              placeholder="Selecione…"
            />
            <SelectField
              label="Banco / origem"
              value={m.origem}
              onChange={(v) => patch(m.id, { origem: v })}
              options={locais}
              placeholder="Selecione…"
            />
            <SelectField
              label="Destino (opcional)"
              value={m.destino}
              onChange={(v) => patch(m.id, { destino: v })}
              options={locais}
              placeholder="Selecione…"
            />
            <TextField
              label="Material (opcional)"
              value={m.material}
              onChange={(v) => patch(m.id, { material: v })}
              placeholder="Ex.: Sinter"
            />
            <TextField
              label="Viagens (opcional)"
              type="number"
              value={m.quantidade}
              onChange={(v) => patch(m.id, { quantidade: v })}
            />
          </div>

          {textoMovimentacao(m) && (
            <p className="mt-2 border-l-2 border-signal/40 pl-2 font-mono text-[11px] text-steel">
              {m.tipo}: {textoMovimentacao(m)}
            </p>
          )}
        </div>
      ))}

      <ActionButton onClick={() => onChange([...itens, novaMovimentacao()])}>
        ＋ Adicionar movimentação
      </ActionButton>
    </div>
  );
}
