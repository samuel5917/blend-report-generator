import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  TURNOS_EQUIP,
  carregarCadastro,
  carregarTurno,
  carregarUltimoTurno,
  dadosVazios,
  formatarData,
  hojeISO,
  salvarCadastro,
  salvarTurno,
  salvarUltimoTurno,
  type DadosTurno,
  type Equipamento,
  type TurnoEquip,
} from "@/lib/equipamentos";
import { InformeDocumento, DOC_LARGURA } from "@/components/equipamentos/InformeDocumento";
import { EquipamentoTabelaEdicao } from "@/components/equipamentos/EquipamentoTabelaEdicao";
import { EquipamentoCadastro } from "@/components/equipamentos/EquipamentoCadastro";
import {
  baixarImagem,
  copiarImagem,
  gerarPng,
  nomeArquivoInforme,
} from "@/lib/exportarEquipamentos";
import { ActionButton, Chip, Label, Section } from "@/components/kit";

export const Route = createFileRoute("/equipamentos")({
  head: () => ({
    meta: [
      { title: "Informe de Turno — Equipamentos Auxiliares | MineShift" },
      {
        name: "description",
        content:
          "Preencha a situação, frente de operação e comunicação com T2 dos equipamentos do turno e exporte o Informe de Turno em PNG pronto para enviar.",
      },
      { property: "og:title", content: "Informe de Turno — Equipamentos Auxiliares" },
      {
        property: "og:description",
        content:
          "Cadastro fixo de equipamentos, preenchimento rápido do turno e exportação do informe oficial em imagem.",
      },
    ],
  }),
  component: EquipamentosPage,
});

function EquipamentosPage() {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [dados, setDados] = useState<Record<string, DadosTurno>>({});
  const [data, setData] = useState(hojeISO());
  const [turno, setTurno] = useState<TurnoEquip>("1°");
  const [abertas, setAbertas] = useState<Record<string, boolean>>({
    preenchimento: true,
    cadastro: false,
    previa: true,
  });
  const [exportando, setExportando] = useState(false);
  const docRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cad = carregarCadastro();
    setEquipamentos(cad);
    const t = carregarTurno();
    if (t) {
      setData(t.data || hojeISO());
      setTurno(t.turno === "2°" ? "2°" : "1°");
      setDados(t.dados ?? {});
    }
  }, []);

  useEffect(() => {
    if (equipamentos.length > 0) salvarCadastro(equipamentos);
  }, [equipamentos]);

  useEffect(() => {
    if (equipamentos.length > 0) salvarTurno({ data, turno, dados });
  }, [data, turno, dados, equipamentos.length]);

  function atualizar(id: string, patch: Partial<DadosTurno>) {
    setDados((prev) => ({ ...prev, [id]: { ...(prev[id] ?? dadosVazios()), ...patch } }));
  }

  function duplicarUltimo() {
    const ultimo = carregarUltimoTurno();
    if (!ultimo) {
      toast.error("Nenhum turno anterior salvo ainda.");
      return;
    }
    setDados(ultimo.dados ?? {});
    toast.success("Dados do último turno carregados.");
  }

  function limpar() {
    setDados({});
    toast.success("Preenchimento do turno limpo.");
  }

  async function exportar(copiar: boolean) {
    const node = docRef.current;
    if (!node) return;
    setExportando(true);
    try {
      const blob = await gerarPng(node);
      salvarUltimoTurno({ data, turno, dados });
      if (copiar) {
        const ok = await copiarImagem(blob);
        if (ok) {
          toast.success("Imagem copiada — use Ctrl + V para colar.");
          return;
        }
        toast.message("Não foi possível copiar aqui — baixando a imagem.");
      }
      baixarImagem(blob, nomeArquivoInforme(data, turno));
      if (!copiar) toast.success("PNG baixado.");
    } catch {
      toast.error("Falha ao gerar a imagem.");
    } finally {
      setExportando(false);
    }
  }

  const ativos = equipamentos.filter((e) => e.ativo).length;

  return (
    <AppShell
      titulo="Informe de Turno"
      subtitulo="Equipamentos Auxiliares"
      acoes={
        <>
          <ActionButton onClick={duplicarUltimo}>DUPLICAR ÚLTIMO TURNO</ActionButton>
          <ActionButton onClick={limpar}>LIMPAR</ActionButton>
        </>
      }
    >
      <div className="space-y-4">
        <div className="glass-panel flex flex-wrap items-end gap-4 px-4 py-3">
          <label className="block">
            <Label>Data</Label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="rounded-md bg-panel2 px-3 py-2 font-mono text-sm text-foreground ring-1 ring-line outline-none focus:ring-signal/60"
            />
          </label>
          <div>
            <Label>Turno</Label>
            <div className="flex gap-1">
              {TURNOS_EQUIP.map((t) => (
                <Chip key={t} active={turno === t} onClick={() => setTurno(t)}>
                  {t} Turno
                </Chip>
              ))}
            </div>
          </div>
          <p className="ml-auto font-mono text-[11px] uppercase tracking-wide text-steel2">
            {ativos} equipamentos ativos · {formatarData(data)} · {turno} turno
          </p>
        </div>


        <Section
          titulo="Preenchimento do turno"
          resumo="altere apenas o que mudou"
          open={!!abertas["preenchimento"]}
          onToggle={() => setAbertas((p) => ({ ...p, preenchimento: !p["preenchimento"] }))}
        >
          <EquipamentoTabelaEdicao
            equipamentos={equipamentos}
            dados={dados}
            onChange={atualizar}
          />
        </Section>

        <Section
          titulo="Pré-visualização do informe"
          resumo="igual à imagem exportada"
          open={!!abertas["previa"]}
          onToggle={() => setAbertas((p) => ({ ...p, previa: !p["previa"] }))}
        >
          <div className="mb-3 flex flex-wrap gap-2">
            <ActionButton variant="primary" onClick={() => exportar(true)}>
              {exportando ? "GERANDO…" : "EXPORTAR E COPIAR"}
            </ActionButton>
            <ActionButton onClick={() => exportar(false)}>BAIXAR PNG</ActionButton>
          </div>
          <div className="overflow-x-auto rounded-md bg-white p-4">
            <div style={{ width: DOC_LARGURA }}>
              <InformeDocumento
                equipamentos={equipamentos}
                dados={dados}
                refDocumento={docRef}
              />
            </div>
          </div>
        </Section>
      </div>
    </AppShell>
  );
}
