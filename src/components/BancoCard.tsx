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
  const completo = !!(banco.planta01.situacao && banco.planta02.situacao);

  return (
    <div
      className={`overflow-hidden rounded-lg ring-1 transition-colors ${
        open ? "bg-panel2/40 ring-signal/30" : "bg-panel2/20 ring-line hover:ring-steel2/50"
      }`}
    >
      {/* Cabeçalho: clique em qualquer lugar abre/fecha */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        className="flex cursor-pointer select-none items-center gap-2.5 px-3 py-2.5"
      >
        <span
          className={`size-2 shrink-0 rounded-full transition-colors ${
            completo ? "bg-ok" : "bg-steel2"
          }`}
        />
        <span className="font-mono text-sm font-semibold text-foreground">{banco.nome}</span>
        {!open && (
          <span className="hidden truncate text-[11px] text-steel2 sm:inline">
            {resumo(banco)}
          </span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-auto shrink-0 rounded px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-wide text-steel2 hover:text-danger"
        >
          Remover
        </button>
        <span
          className={`shrink-0 text-steel2 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </div>

      {/* Conteúdo com animação suave de altura */}
      <div
        className={`grid transition-all duration-200 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-3 pb-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <PlantaBloco
                titulo="Planta-01"
                value={banco.planta01}
                onChange={(patch) =>
                  onChange({ ...banco, planta01: { ...banco.planta01, ...patch } })
                }
              />
              <PlantaBloco
                titulo="Planta-02"
                value={banco.planta02}
                onChange={(patch) =>
                  onChange({ ...banco, planta02: { ...banco.planta02, ...patch } })
                }
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
        </div>
      </div>
    </div>
  );
}
