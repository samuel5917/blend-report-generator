import { useState } from "react";
import { CATEGORIAS, type Categoria, type Equipamento } from "@/lib/equipamentos";
import { ActionButton, SelectField, TextField } from "@/components/kit";
import { cn } from "@/lib/utils";

export function EquipamentoCadastro({
  equipamentos,
  onChange,
}: {
  equipamentos: Equipamento[];
  onChange: (lista: Equipamento[]) => void;
}) {
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState<string>("Auxiliar");
  const [arrastando, setArrastando] = useState<string | null>(null);

  function adicionar() {
    const limpo = nome.trim();
    if (!limpo) return;
    onChange([
      ...equipamentos,
      {
        id: `eq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        nome: limpo,
        categoria: (CATEGORIAS.includes(categoria as Categoria) ? categoria : "Auxiliar") as Categoria,
        ordem: equipamentos.length,
        ativo: true,
      },
    ]);
    setNome("");
  }

  function mover(origemId: string, destinoId: string) {
    if (origemId === destinoId) return;
    const lista = [...equipamentos];
    const i = lista.findIndex((e) => e.id === origemId);
    const j = lista.findIndex((e) => e.id === destinoId);
    if (i < 0 || j < 0) return;
    const [item] = lista.splice(i, 1);
    lista.splice(j, 0, item!);
    onChange(lista.map((e, k) => ({ ...e, ordem: k })));
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-[1fr_190px_auto]">
        <TextField
          label="Novo equipamento"
          value={nome}
          onChange={setNome}
          placeholder="CB-2010 - Caminhão Bascula"
        />
        <SelectField
          label="Categoria"
          value={categoria}
          onChange={setCategoria}
          options={CATEGORIAS}
          placeholder="Auxiliar"
        />
        <div className="flex items-end">
          <ActionButton variant="primary" onClick={adicionar}>
            ADICIONAR
          </ActionButton>
        </div>
      </div>

      <p className="font-mono text-[10px] uppercase tracking-wide text-steel2">
        Arraste pelo ☰ para mudar a ordem
      </p>

      <ul className="space-y-1">
        {equipamentos.map((eq) => (
          <li
            key={eq.id}
            draggable
            onDragStart={() => setArrastando(eq.id)}
            onDragEnd={() => setArrastando(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (arrastando) mover(arrastando, eq.id);
              setArrastando(null);
            }}
            className={cn(
              "flex items-center gap-3 rounded-md bg-panel px-3 py-2 ring-1 ring-line",
              arrastando === eq.id && "opacity-50",
              !eq.ativo && "opacity-60",
            )}
          >
            <span className="cursor-grab select-none text-steel2">☰</span>
            <span
              className={cn(
                "font-mono text-[12px] text-foreground",
                !eq.ativo && "line-through decoration-steel2",
              )}
            >
              {eq.nome}
            </span>
            <span className="font-mono text-[10px] uppercase text-steel2">{eq.categoria}</span>
            <div className="ml-auto flex gap-2">
              <ActionButton
                onClick={() =>
                  onChange(
                    equipamentos.map((e) => (e.id === eq.id ? { ...e, ativo: !e.ativo } : e)),
                  )
                }
              >
                {eq.ativo ? "DESATIVAR" : "REATIVAR"}
              </ActionButton>
              <ActionButton
                variant="danger"
                onClick={() => onChange(equipamentos.filter((e) => e.id !== eq.id))}
              >
                EXCLUIR
              </ActionButton>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
