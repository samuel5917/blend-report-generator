import { useEffect, useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import type { ImagemT2 } from "@/lib/blendRegistros";
import { cn } from "@/lib/utils";
import { Label } from "@/components/kit";

/**
 * Campo de imagens do controle T2: aceita CTRL+V, arrastar e soltar e seleção de arquivo.
 * As imagens novas ficam como arquivo pendente até o salvamento.
 */
export function ImagensT2({
  imagens,
  onChange,
  onRemoverSalva,
}: {
  imagens: ImagemT2[];
  onChange: (imgs: ImagemT2[]) => void;
  onRemoverSalva?: (img: { id: string; storage_path: string }) => void;
}) {
  const [sobre, setSobre] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);

  const adicionar = (files: FileList | File[] | null) => {
    const lista = Array.from(files ?? []).filter((f) => f.type.startsWith("image/"));
    if (lista.length === 0) return;
    const novas = lista.map((file, i) => ({
      url: URL.createObjectURL(file),
      file,
      ordem: imagens.length + i,
    }));
    onChange([...imagens, ...novas]);
  };

  // CTRL + V em qualquer lugar da tela quando o campo está visível
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const arquivos = Array.from(e.clipboardData?.files ?? []);
      const itens = Array.from(e.clipboardData?.items ?? [])
        .filter((i) => i.type.startsWith("image/"))
        .map((i) => i.getAsFile())
        .filter((f): f is File => !!f);
      const todos = arquivos.length > 0 ? arquivos : itens;
      if (todos.length > 0) {
        e.preventDefault();
        adicionar(todos);
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  });

  const remover = (idx: number) => {
    const img = imagens[idx];
    if (img?.id && img.storage_path && onRemoverSalva)
      onRemoverSalva({ id: img.id, storage_path: img.storage_path });
    onChange(imagens.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <Label>Imagem do controle T2 (obrigatória)</Label>
      <div
        ref={areaRef}
        onDragOver={(e) => {
          e.preventDefault();
          setSobre(true);
        }}
        onDragLeave={() => setSobre(false)}
        onDrop={(e) => {
          e.preventDefault();
          setSobre(false);
          adicionar(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        className={cn(
          "cursor-pointer rounded-lg border border-dashed px-4 py-5 text-center transition-colors",
          sobre ? "border-signal bg-signal/10" : "border-line hover:border-signal/50",
        )}
      >
        <ImagePlus aria-hidden="true" className="mx-auto size-5 text-steel2" strokeWidth={1.75} />
        <p className="mt-2 text-sm text-steel">
          Cole o print com <span className="font-semibold text-foreground">CTRL + V</span>, arraste
          aqui ou clique para escolher o arquivo.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            adicionar(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {imagens.length > 0 && (
        <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {imagens.map((img, i) => (
            <li key={img.id ?? img.url} className="relative overflow-hidden rounded-md ring-1 ring-line">
              <img src={img.url} alt={`Controle T2 ${i + 1}`} className="h-28 w-full object-cover" />
              <button
                type="button"
                aria-label="Remover imagem"
                onClick={(e) => {
                  e.stopPropagation();
                  remover(i);
                }}
                className="absolute right-1 top-1 rounded bg-shell/80 p-1 text-danger ring-1 ring-danger/40"
              >
                <Trash2 aria-hidden="true" className="size-3.5" strokeWidth={1.75} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
