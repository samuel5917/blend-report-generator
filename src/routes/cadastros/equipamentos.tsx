import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { EquipamentoCadastro } from "@/components/equipamentos/EquipamentoCadastro";
import { carregarCadastro, salvarCadastro, type Equipamento } from "@/lib/equipamentos";
import { Chip } from "@/components/kit";

export const Route = createFileRoute("/cadastros/equipamentos")({
  head: () => ({
    meta: [
      { title: "Cadastro de Equipamentos | MineShift" },
      {
        name: "description",
        content:
          "Adicione, edite, desative, exclua e reordene os equipamentos usados no Informe de Turno do MineShift.",
      },
      { property: "og:title", content: "Cadastro de Equipamentos | MineShift" },
      {
        property: "og:description",
        content: "Administração da lista de equipamentos do Informe de Turno.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CadastroEquipamentos,
});

function CadastroEquipamentos() {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    setEquipamentos(carregarCadastro());
    setPronto(true);
  }, []);

  useEffect(() => {
    if (pronto && equipamentos.length > 0) salvarCadastro(equipamentos);
  }, [equipamentos, pronto]);

  const ativos = equipamentos.filter((e) => e.ativo).length;

  return (
    <AppShell
      titulo="Cadastro de Equipamentos"
      subtitulo="Cadastros · administração"
      largura="max-w-[1100px]"
    >
      <section className="glass-panel p-5">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <h2 className="text-[15px] font-semibold text-foreground">Equipamentos</h2>
          <Chip>{ativos} ativos</Chip>
          <Chip>{equipamentos.length - ativos} inativos</Chip>
          <p className="ml-auto font-mono text-[10px] uppercase tracking-wide text-steel2">
            usado pelo Informe de Equipamentos
          </p>
        </div>
        <EquipamentoCadastro equipamentos={equipamentos} onChange={setEquipamentos} />
      </section>
    </AppShell>
  );
}
