import { useState } from "react";
import {
  OBS_BANCO_SUGESTOES,
  P1_MOTIVOS_SEM_MOV,
  P1_SITUACOES,
  P2_COMPLEMENTOS_ATENDIDO,
  P2_MOTIVOS_NAO_ATENDIDO,
  P2_MOTIVOS_PARCIAL,
  P2_SITUACOES,
  type BancoState,
} from "@/config/blend";
import { textoPlanta01, textoPlanta02 } from "@/lib/justificativa";
import { ActionButton, Chip, Label, SelectField, TextArea, TextField } from "@/components/kit";

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

const resumo = (b: BancoState) =>
  `Planta 01: ${b.planta01.situacao || "—"} · Planta 02: ${b.planta02.situacao || "—"}`;

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
  const [obsAberta, setObsAberta] = useState(banco.observacao.length > 0);
  const p1 = banco.planta01;
  const p2 = banco.planta02;

  const setP1 = (patch: Partial<typeof p1>) =>
    onChange({ ...banco, planta01: { ...p1, ...patch } });
  const setP2 = (patch: Partial<typeof p2>) =>
    onChange({ ...banco, planta02: { ...p2, ...patch } });

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

  const motivosP2 =
    p2.situacao === "Atendido parcialmente"
      ? P2_MOTIVOS_PARCIAL
      : p2.situacao === "Não atendido" || p2.situacao === "Não houve movimentação"
        ? P2_MOTIVOS_NAO_ATENDIDO
        : [];

  const mostraViagensP2 =
    p2.situacao === "Atendido" ||
    p2.situacao === "Atendido parcialmente" ||
    p2.situacao === "Não atendido" ||
    p2.situacao === "Substituído por outro material";

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
        {/* PLANTA 01 */}
        <div className="rounded-lg bg-panel p-3 ring-1 ring-line">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-wide text-steel2">
            Planta 01
          </div>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {P1_SITUACOES.map((s) => (
              <Chip
                key={s}
                active={p1.situacao === s}
                onClick={() =>
                  setP1({ situacao: p1.situacao === s ? "" : s, motivo: "", motivoOutro: "" })
                }
              >
                {s}
              </Chip>
            ))}
          </div>

          {p1.situacao === "Não houve movimentação" && (
            <div className="space-y-2">
              <SelectField
                label="Motivo"
                value={p1.motivo}
                onChange={(v) => setP1({ motivo: v })}
                options={P1_MOTIVOS_SEM_MOV}
              />
              {p1.motivo === "Outro" && (
                <TextField
                  label="Descreva o motivo"
                  value={p1.motivoOutro}
                  onChange={(v) => setP1({ motivoOutro: v })}
                  placeholder="motivo"
                />
              )}
            </div>
          )}

          {p1.situacao === "Atendido parcialmente" && (
            <div className="space-y-2">
              <SelectField
                label="Motivo"
                value={p1.motivo}
                onChange={(v) => setP1({ motivo: v })}
                options={P2_MOTIVOS_PARCIAL}
              />
              {p1.motivo === "Outro" && (
                <TextField
                  label="Descreva o motivo"
                  value={p1.motivoOutro}
                  onChange={(v) => setP1({ motivoOutro: v })}
                />
              )}
            </div>
          )}

          {(p1.situacao === "Outra situação" || p1.situacao === "Atendido") && (
            <TextArea
              label={p1.situacao === "Outra situação" ? "Descreva a situação" : "Complemento (opcional)"}
              value={p1.texto}
              onChange={(v) => setP1({ texto: v })}
              placeholder="Texto exatamente como deve aparecer."
            />
          )}

          {textoPlanta01(banco) && (
            <p className="mt-2 border-l-2 border-signal/40 pl-2 font-mono text-[11px] leading-relaxed text-steel">
              {textoPlanta01(banco)}
            </p>
          )}
        </div>

        {/* PLANTA 02 */}
        <div className="rounded-lg bg-panel p-3 ring-1 ring-line">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-wide text-steel2">
            Planta 02
          </div>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {P2_SITUACOES.map((s) => (
              <Chip
                key={s}
                active={p2.situacao === s}
                onClick={() =>
                  setP2({
                    situacao: p2.situacao === s ? "" : s,
                    motivos: [],
                    complementos: [],
                    motivoOutro: "",
                  })
                }
              >
                {s}
              </Chip>
            ))}
          </div>

          {p2.situacao === "Atendido" && (
            <div className="mb-3">
              <Label>Complementos</Label>
              <div className="flex flex-wrap gap-1.5">
                {P2_COMPLEMENTOS_ATENDIDO.map((c) => (
                  <Chip
                    key={c}
                    size="sm"
                    active={p2.complementos.includes(c)}
                    onClick={() => setP2({ complementos: toggle(p2.complementos, c) })}
                  >
                    {c}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {motivosP2.length > 0 && (
            <div className="mb-3">
              <Label>Motivos (pode marcar vários)</Label>
              <div className="flex flex-wrap gap-1.5">
                {motivosP2.map((m) => (
                  <Chip
                    key={m}
                    size="sm"
                    active={p2.motivos.includes(m)}
                    onClick={() => setP2({ motivos: toggle(p2.motivos, m) })}
                  >
                    {m}
                  </Chip>
                ))}
              </div>
              {p2.motivos.includes("Outro") && (
                <div className="mt-2">
                  <TextField
                    label="Descreva o motivo"
                    value={p2.motivoOutro}
                    onChange={(v) => setP2({ motivoOutro: v })}
                  />
                </div>
              )}
            </div>
          )}

          {mostraViagensP2 && (
            <div className="grid grid-cols-3 gap-2">
              <TextField
                label="Programadas"
                value={p2.viagensProgramadas}
                onChange={(v) => setP2({ viagensProgramadas: v })}
                placeholder="—"
                type="number"
              />
              <TextField
                label="Realizadas"
                value={p2.viagensRealizadas}
                onChange={(v) => setP2({ viagensRealizadas: v })}
                placeholder="—"
                type="number"
              />
              <TextField
                label="Aderência %"
                value={p2.aderencia}
                onChange={(v) => setP2({ aderencia: v })}
                placeholder="—"
              />
            </div>
          )}

          {p2.situacao === "Outra situação" && (
            <div className="mt-2">
              <TextArea
                label="Descreva a situação"
                value={p2.texto}
                onChange={(v) => setP2({ texto: v })}
              />
            </div>
          )}

          {p2.situacao && (
            <div className="mt-3 border-t border-line pt-3">
              <Chip
                size="sm"
                active={p2.temSubstituicao}
                onClick={() => setP2({ temSubstituicao: !p2.temSubstituicao })}
              >
                Viagens substituídas por outro material/banco
              </Chip>
              {p2.temSubstituicao && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <TextField
                    label="Banco previsto"
                    value={p2.substituicao.bancoPrevisto}
                    onChange={(v) =>
                      setP2({ substituicao: { ...p2.substituicao, bancoPrevisto: v } })
                    }
                  />
                  <TextField
                    label="Banco utilizado"
                    value={p2.substituicao.bancoUtilizado}
                    onChange={(v) =>
                      setP2({ substituicao: { ...p2.substituicao, bancoUtilizado: v } })
                    }
                  />
                  <TextField
                    label="Viagens"
                    type="number"
                    value={p2.substituicao.viagens}
                    onChange={(v) => setP2({ substituicao: { ...p2.substituicao, viagens: v } })}
                  />
                  <TextField
                    label="Motivo"
                    value={p2.substituicao.motivo}
                    onChange={(v) => setP2({ substituicao: { ...p2.substituicao, motivo: v } })}
                  />
                  <TextField
                    className="col-span-2"
                    label="Orientação / autorização"
                    value={p2.substituicao.autorizacao}
                    onChange={(v) =>
                      setP2({ substituicao: { ...p2.substituicao, autorizacao: v } })
                    }
                  />
                </div>
              )}
            </div>
          )}

          {textoPlanta02(banco) && (
            <p className="mt-2 border-l-2 border-signal/40 pl-2 font-mono text-[11px] leading-relaxed text-steel">
              {textoPlanta02(banco)}
            </p>
          )}
        </div>
      </div>

      {/* Observação do banco */}
      <div className="mt-3">
        {obsAberta ? (
          <div className="space-y-2">
            <TextArea
              label="Observação do banco"
              value={banco.observacao}
              onChange={(v) => onChange({ ...banco, observacao: v })}
              placeholder="Observação livre"
            />
            <div className="flex flex-wrap gap-1.5">
              {OBS_BANCO_SUGESTOES.map((s) => (
                <Chip
                  key={s}
                  size="sm"
                  onClick={() =>
                    onChange({
                      ...banco,
                      observacao: banco.observacao ? `${banco.observacao} ${s}` : s,
                    })
                  }
                >
                  + {s}
                </Chip>
              ))}
            </div>
          </div>
        ) : (
          <ActionButton onClick={() => setObsAberta(true)}>＋ Adicionar observação</ActionButton>
        )}
      </div>
    </div>
  );
}
