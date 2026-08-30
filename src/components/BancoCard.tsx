import { useState } from "react";
import {
  PLANTA_MOTIVOS,
  PLANTA_SITUACOES,
  type BancoState,
  type PlantaSituacao,
  type PlantaState,
} from "@/config/blend";
import { textoPlanta } from "@/lib/justificativa";
import { Chip, SelectField, TextArea, TextField } from "@/components/kit";

const resumo = (b: BancoState) =>
  `Planta-01: ${b.planta01.situacao || "—"} · Planta-02: ${b.planta02.situacao || "—"}`;

function PlantaBloco({
  titulo,
  value,
  onChange,
}: {
  titulo: string;
  value: PlantaState;
  onChange: (patch: Partial<PlantaState>) => void;
}) {
  const exigeMotivo =
    value.situacao === "Não Atendido" || value.situacao === "Atendido Parcialmente";

  return (
    <div className="rounded-lg bg-panel p-3 ring-1 ring-line">
      <div className="mb-2 font-mono text-[10px] uppercase tracking-wide text-steel2">{titulo}</div>
      <div className="flex flex-wrap gap-1.5">
        {PLANTA_SITUACOES.map((s) => (
          <Chip
            key={s}
            active={value.situacao === s}
            onClick={() =>
              onChange({
                situacao: value.situacao === s ? "" : (s as PlantaSituacao),
                motivo: "",
                motivoOutro: "",
                texto: "",
              })
            }
          >
            {s}
          </Chip>
        ))}
      </div>

      {value.situacao === "Atendido" && (
        <p className="mt-2 font-mono text-[11px] text-ok">Motivo: Ok</p>
      )}

      {exigeMotivo && (
        <div className="mt-2 space-y-2">
          <SelectField
            label="Motivo"
            value={value.motivo}
            onChange={(v) => onChange({ motivo: v })}
            options={PLANTA_MOTIVOS}
            placeholder="Selecione o motivo…"
          />
          {value.motivo === "Outros" && (
            <TextField
              label="Descreva o motivo"
              value={value.motivoOutro}
              onChange={(v) => onChange({ motivoOutro: v })}
            />
          )}
          {!value.motivo && (
            <p className="font-mono text-[11px] text-danger">Motivo obrigatório.</p>
          )}
        </div>
      )}

      {value.situacao === "Outros" && (
        <div className="mt-2">
          <TextArea
            label="Justificativa personalizada"
            value={value.texto}
            onChange={(v) => onChange({ texto: v })}
            placeholder="Texto exatamente como deve aparecer."
          />
        </div>
      )}

      {textoPlanta(value) && (
        <p className="mt-2 border-l-2 border-signal/40 pl-2 font-mono text-[11px] leading-relaxed text-steel">
          {textoPlanta(value)}
        </p>
      )}
    </div>
  );
}

export function BancoCard({
  banco,
  onChange,
  onRemove,
}: {
  banco: BancoState;
  onChange: (b: BancoState) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(true);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2 rounded-lg bg-panel2/40 px-3 py-2.5 text-left ring-1 ring-line"
      >
        <span className="size-2 rounded-full bg-steel2" />
        <span className="font-mono text-sm text-steel">{banco.nome}</span>
        <span className="text-[11px] text-steel2">{resumo(banco)}</span>
        <span className="ml-auto text-steel2">▾</span>
      </button>
    );
  }

  return (
    <div className="rounded-lg bg-panel2/40 p-3 ring-1 ring-signal/30">
      <div className="mb-3 flex items-center gap-2">
        <span className="size-2 rounded-full bg-signal" />
        <span className="font-mono text-sm font-semibold text-foreground">{banco.nome}</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="ml-auto font-mono text-[11px] uppercase tracking-wide text-steel2 hover:text-steel"
        >
          Recolher
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="font-mono text-[11px] uppercase tracking-wide text-steel2 hover:text-danger"
        >
          Remover
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <PlantaBloco
          titulo="Planta-01"
          value={banco.planta01}
          onChange={(patch) => onChange({ ...banco, planta01: { ...banco.planta01, ...patch } })}
        />
        <PlantaBloco
          titulo="Planta-02"
          value={banco.planta02}
          onChange={(patch) => onChange({ ...banco, planta02: { ...banco.planta02, ...patch } })}
        />
      </div>

      <div className="mt-3">
        <TextField
          label="Observação do banco (opcional)"
          value={banco.observacao}
          onChange={(v) => onChange({ ...banco, observacao: v })}
        />
      </div>
    </div>
  );
}
