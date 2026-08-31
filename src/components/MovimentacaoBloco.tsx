import type { MovimentacaoState } from "@/config/blend";
import { Chip, SelectField, TextField } from "@/components/kit";

export function MovimentacaoBloco({
  titulo,
  labelNao,
  labelSim,
  value,
  onChange,
  bancos,
}: {
  titulo: string;
  labelNao: string;
  labelSim: string;
  value: MovimentacaoState;
  onChange: (v: MovimentacaoState) => void;
  bancos: string[];
}) {
  const set = (patch: Partial<MovimentacaoState>) => onChange({ ...value, ...patch });

  return (
    <div className="rounded-lg bg-panel2/40 p-3 ring-1 ring-line">
      <div className="mb-2 font-mono text-[10px] uppercase tracking-wide text-steel2">{titulo}</div>
      <div className="flex flex-wrap gap-1.5">
        <Chip active={!value.houve} onClick={() => set({ houve: false })}>
          {labelNao}
        </Chip>
        <Chip active={value.houve} onClick={() => set({ houve: true })}>
          {labelSim}
        </Chip>
      </div>

      {!value.houve && <p className="mt-2 font-mono text-[11px] text-ok">Ok.</p>}

      {value.houve && (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <SelectField
            label="Banco de origem"
            value={value.origem}
            onChange={(v) => set({ origem: v })}
            options={bancos}
            placeholder="Selecione o banco…"
          />
          <SelectField
            label="Banco de destino"
            value={value.destino}
            onChange={(v) => set({ destino: v })}
            options={bancos}
            placeholder="Selecione o banco…"
          />
          <TextField
            label="Quantidade de viagens (opcional)"
            type="number"
            value={value.quantidade}
            onChange={(v) => set({ quantidade: v })}
          />
        </div>
      )}
    </div>
  );
}
