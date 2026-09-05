import {
  COMUNICACOES,
  SITUACOES,
  dadosVazios,
  type ComunicacaoT2,
  type DadosTurno,
  type Equipamento,
  type Situacao,
} from "@/lib/equipamentos";
import { cn } from "@/lib/utils";

export function EquipamentoTabelaEdicao({
  equipamentos,
  dados,
  onChange,
}: {
  equipamentos: Equipamento[];
  dados: Record<string, DadosTurno>;
  onChange: (id: string, patch: Partial<DadosTurno>) => void;
}) {
  const ativos = equipamentos.filter((e) => e.ativo);

  if (ativos.length === 0) {
    return (
      <p className="px-4 py-6 text-sm text-steel2">
        Nenhum equipamento ativo. Ative ou adicione equipamentos no cadastro.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[880px] border-separate border-spacing-y-1 text-sm">
        <thead>
          <tr className="font-mono text-[10px] uppercase tracking-wide text-steel2">
            <th className="w-[210px] px-2 text-left font-normal">Equipamento</th>
            <th className="w-[260px] px-2 text-left font-normal">Situação</th>
            <th className="px-2 text-left font-normal">Frente de operação</th>
            <th className="w-[190px] px-2 text-left font-normal">Comunicação T2</th>
            <th className="w-[200px] px-2 text-left font-normal">Observação</th>
          </tr>
        </thead>
        <tbody>
          {ativos.map((eq) => {
            const d = dados[eq.id] ?? dadosVazios();
            return (
              <tr key={eq.id} className="bg-panel">
                <td className="rounded-l-md px-2 py-1.5 font-mono text-[12px] text-foreground">
                  {eq.nome}
                </td>
                <td className="px-2 py-1.5">
                  <div className="flex gap-1">
                    {SITUACOES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => onChange(eq.id, { situacao: s })}
                        className={cn(
                          "rounded px-2 py-1 text-[11px] ring-1 transition-colors",
                          d.situacao === s
                            ? s === "Manutenção"
                              ? "bg-danger/20 text-danger ring-danger/50"
                              : s === "Operando"
                                ? "bg-signal/20 text-signal ring-signal/50"
                                : "bg-panel2 text-foreground ring-line"
                            : "text-steel2 ring-line hover:text-foreground",
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </td>
                <td className="px-2 py-1.5">
                  <input
                    value={d.frenteOperacao}
                    onChange={(e) => onChange(eq.id, { frenteOperacao: e.target.value })}
                    placeholder="N/a"
                    className="w-full rounded bg-panel2 px-2 py-1 text-[12px] text-foreground ring-1 ring-line outline-none focus:ring-signal/60 placeholder:text-steel2"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <div className="flex gap-1">
                    {COMUNICACOES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => onChange(eq.id, { comunicacaoT2: c })}
                        className={cn(
                          "rounded px-2 py-1 text-[11px] ring-1 transition-colors",
                          d.comunicacaoT2 === c
                            ? c === "Não"
                              ? "bg-danger/20 text-danger ring-danger/50"
                              : c === "Sim"
                                ? "bg-signal/20 text-signal ring-signal/50"
                                : "bg-panel2 text-foreground ring-line"
                            : "text-steel2 ring-line hover:text-foreground",
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </td>
                <td className="rounded-r-md px-2 py-1.5">
                  <input
                    value={d.observacaoComunicacao}
                    onChange={(e) => onChange(eq.id, { observacaoComunicacao: e.target.value })}
                    placeholder="—"
                    className="w-full rounded bg-panel2 px-2 py-1 text-[12px] text-foreground ring-1 ring-line outline-none focus:ring-signal/60 placeholder:text-steel2"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export type { Situacao, ComunicacaoT2 };
