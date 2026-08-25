import type { MovimentacaoState } from "@/config/blend";
import { Chip, TextArea, TextField } from "@/components/kit";

export interface CamposMov {
  quantidade?: boolean;
  material?: boolean;
  origem?: boolean;
  destino?: boolean;
  pilha?: boolean;
  descricao?: boolean;
  orientacao?: boolean;
}

export function MovimentacaoBloco({
  titulo,
  labelNao,
  labelSim,
  value,
  onChange,
  campos,
}: {
  titulo: string;
  labelNao: string;
  labelSim: string;
  value: MovimentacaoState;
  onChange: (v: MovimentacaoState) => void;
  campos: CamposMov;
}) {
  const set = (patch: Partial<MovimentacaoState>) => onChange({ ...value, ...patch });

  return (
    <div className="rounded-lg bg-panel2/40 p-3 ring-1 ring-line">
      <div className="mb-2 font-mono text-[10px] uppercase tracking-wide text-steel2">
        {titulo}
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Chip active={!value.houve} onClick={() => set({ houve: false })}>
          {labelNao}
        </Chip>
        <Chip active={value.houve} onClick={() => set({ houve: true })}>
          {labelSim}
        </Chip>
      </div>

      {value.houve && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {campos.quantidade && (
            <TextField
              label="Quantidade de viagens"
              type="number"
              value={value.quantidade}
              onChange={(v) => set({ quantidade: v })}
            />
          )}
          {campos.material && (
            <TextField
              label="Material"
              value={value.material}
              onChange={(v) => set({ material: v })}
              placeholder="ex.: sínter"
            />
          )}
          {campos.origem && (
            <TextField label="Origem" value={value.origem} onChange={(v) => set({ origem: v })} />
          )}
          {campos.destino && (
            <TextField
              label="Destino"
              value={value.destino}
              onChange={(v) => set({ destino: v })}
            />
          )}
          {campos.pilha && (
            <TextField
              label="Pilha / Baia"
              value={value.pilha}
              onChange={(v) => set({ pilha: v })}
            />
          )}
          {campos.descricao && (
            <div className="col-span-2">
              <TextArea
                label="Descrição"
                value={value.descricao}
                onChange={(v) => set({ descricao: v })}
              />
            </div>
          )}
          {campos.orientacao && (
            <div className="col-span-2">
              <TextField
                label="Orientação / alinhamento (opcional)"
                value={value.orientacao}
                onChange={(v) => set({ orientacao: v })}
              />
            </div>
          )}
          <div className="col-span-2">
            <TextArea
              label="Observação"
              value={value.observacao}
              onChange={(v) => set({ observacao: v })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
