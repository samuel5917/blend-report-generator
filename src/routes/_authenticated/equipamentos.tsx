import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
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
  salvarTurno,
  salvarUltimoTurno,
  type DadosTurno,
  type Equipamento,
  type TurnoEquip,
} from "@/lib/equipamentos";
import { InformeDocumento, DOC_LARGURA } from "@/components/equipamentos/InformeDocumento";
import { EquipamentoTabelaEdicao } from "@/components/equipamentos/EquipamentoTabelaEdicao";
import {
  baixarImagem,
  copiarImagem,
  gerarPng,
  nomeArquivoInforme,
} from "@/lib/exportarEquipamentos";
import { ActionButton, Chip, Label, Section } from "@/components/kit";

export const Route = createFileRoute("/_authenticated/equipamentos")({
  head: () => ({
    meta: [
      { title: "Informe de Turno — Equipamentos Auxiliares | CCO TRINDADE" },
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
    previa: true,
  });
  const [exportando, setExportando] = useState(false);
  const docRef = useRef<HTMLDivElement>(null);
  const carregado = useRef(false);
  const ultimoSalvo = useRef<Record<string, DadosTurno> | null>(null);

  const obter = useServerFn(obterInformeEquipamentos);
  const persistir = useServerFn(salvarInformeEquipamentos);

  useEffect(() => {
    setEquipamentos(carregarCadastro());
    let ativo = true;
    void obter()
      .then((res) => {
        if (!ativo) return;
        const base = res.informe ?? res.rascunho;
        if (res.informe) ultimoSalvo.current = res.informe.dados as Record<string, DadosTurno>;
        if (base) {
          setData(base.data || hojeISO());
          setTurno(base.turno === "2°" ? "2°" : "1°");
          setDados((base.dados ?? {}) as Record<string, DadosTurno>);
        }
      })
      .catch(() => {
        toast.error("Não foi possível carregar seu último informe.");
      })
      .finally(() => {
        if (ativo) carregado.current = true;
      });
    return () => {
      ativo = false;
    };
  }, [obter]);

  // Salvamento automático do rascunho do usuário autenticado
  useEffect(() => {
    if (!carregado.current) return;
    const timer = setTimeout(() => {
      void persistir({ data: { informe: { data, turno, dados }, tipo: "rascunho" } }).catch(
        () => undefined,
      );
    }, 800);
    return () => clearTimeout(timer);
  }, [data, turno, dados, persistir]);

  function atualizar(id: string, patch: Partial<DadosTurno>) {
    setDados((prev) => ({ ...prev, [id]: { ...(prev[id] ?? dadosVazios()), ...patch } }));
  }

  function duplicarUltimo() {
    const ultimo = ultimoSalvo.current;
    if (!ultimo) {
      toast.error("Nenhum turno anterior salvo ainda.");
      return;
    }
    setDados(ultimo);
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
      ultimoSalvo.current = dados;
      await persistir({ data: { informe: { data, turno, dados }, tipo: "salvo" } }).catch(
        () => undefined,
      );
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
