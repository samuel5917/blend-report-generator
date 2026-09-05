import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ActionButton, TextField } from "@/components/kit";
import { cadastrar, entrar } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Acesso ao CCO TRINDADE | Entrar ou criar conta" },
      {
        name: "description",
        content:
          "Entre com seu usuário e senha para registrar justificativas do Blend no CCO TRINDADE ou crie um novo acesso.",
      },
      { property: "og:title", content: "Acesso ao CCO TRINDADE" },
      {
        property: "og:description",
        content: "Entre com seu usuário e senha para registrar as justificativas do turno.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Acesso,
});

function Acesso() {
  const navigate = useNavigate();
  const [modo, setModo] = useState<"entrar" | "cadastrar">("entrar");
  const [usuario, setUsuario] = useState("");
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const enviar = async () => {
    setErro(null);
    setAviso(null);
    setOcupado(true);
    try {
      if (modo === "entrar") {
        await entrar(usuario, senha);
        await navigate({ to: "/blend" });
      } else {
        await cadastrar(usuario, nome, senha);
        try {
          await entrar(usuario, senha);
          await navigate({ to: "/blend" });
        } catch {
          setAviso("Cadastro criado. Faça login com seu usuário e senha.");
          setModo("entrar");
        }
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível concluir.");
    } finally {
      setOcupado(false);
    }
  };

  return (
    <AppShell titulo="Acesso" subtitulo="Identificação do responsável" largura="max-w-[520px]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void enviar();
        }}
        className="glass-panel space-y-4 px-5 py-6"
      >
        <div className="inline-flex rounded-md bg-panel2 p-0.5 ring-1 ring-line">
          {(["entrar", "cadastrar"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setModo(m)}
              className={
                modo === m
                  ? "rounded bg-signal px-4 py-1.5 text-sm font-medium text-signal-foreground"
                  : "rounded px-4 py-1.5 text-sm font-medium text-steel hover:text-foreground"
              }
            >
              {m === "entrar" ? "Entrar" : "Criar acesso"}
            </button>
          ))}
        </div>

        <TextField label="Usuário" value={usuario} onChange={setUsuario} placeholder="samuel" />
        {modo === "cadastrar" && (
          <TextField
            label="Nome completo"
            value={nome}
            onChange={setNome}
            placeholder="Samuel Silva"
          />
        )}
        <TextField label="Senha" type="password" value={senha} onChange={setSenha} />

        {erro && (
          <p className="rounded-md bg-danger/10 px-3 py-2 font-mono text-[11px] text-danger">
            {erro}
          </p>
        )}
        {aviso && (
          <p className="rounded-md bg-ok/10 px-3 py-2 font-mono text-[11px] text-ok">{aviso}</p>
        )}

        <ActionButton type="submit" variant="primary" className="w-full py-3">
          {ocupado ? "AGUARDE…" : modo === "entrar" ? "ENTRAR" : "CRIAR ACESSO"}
        </ActionButton>
      </form>
    </AppShell>
  );
}
