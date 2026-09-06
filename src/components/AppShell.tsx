import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import {
  BookOpen,
  FileText,
  LogOut,
  Home,
  Layers,
  Link2,
  Mail,
  Menu as MenuIcon,
  MessageSquare,
  Settings,
  Tractor,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sair, useAuth } from "@/lib/auth";
import marcaCCO from "@/assets/cco-trindade-marca.png.asset.json";

interface ItemNav {
  to:
    | "/"
    | "/equipamentos"
    | "/mensagens"
    | "/blend"
    | "/ata"
    | "/relatorios/blend"
    | "/cadastros/equipamentos"
    | "/cadastros/bancos"
    | "/cadastros/mensagens"
    | "/cadastros/atalhos"
    | "/configuracoes";
  Icone: LucideIcon;
  rotulo: string;
  detalhe?: string;
}

const GRUPOS: Array<{ titulo: string; itens: ItemNav[] }> = [
  {
    titulo: "Principal",
    itens: [
      { to: "/", Icone: Home, rotulo: "Dashboard" },
      { to: "/equipamentos", Icone: Tractor, rotulo: "Equipamentos", detalhe: "informe do turno" },
      { to: "/mensagens", Icone: MessageSquare, rotulo: "Mensagens T2" },
      { to: "/blend", Icone: BookOpen, rotulo: "Justificativa do Blend" },
      { to: "/ata", Icone: Mail, rotulo: "Elaboração de Ata" },
    ],
  },
  {
    titulo: "Relatórios",
    itens: [
      { to: "/relatorios/blend", Icone: FileText, rotulo: "Relatório de Blend", detalhe: "pdf" },
    ],
  },
  {
    titulo: "Cadastros",
    itens: [
      { to: "/cadastros/equipamentos", Icone: Tractor, rotulo: "Equipamentos", detalhe: "administração" },
      { to: "/cadastros/bancos", Icone: Layers, rotulo: "Bancos", detalhe: "bancos e locais" },
      { to: "/cadastros/mensagens", Icone: MessageSquare, rotulo: "Mensagens T2", detalhe: "administração" },
      { to: "/cadastros/atalhos", Icone: Link2, rotulo: "Atalhos do CCO", detalhe: "sistemas" },
    ],
  },
  {
    titulo: "Sistema",
    itens: [{ to: "/configuracoes", Icone: Settings, rotulo: "Configurações" }],
  },
];


export function AppShell({
  titulo,
  subtitulo,
  acoes,
  children,
  largura = "max-w-[1440px]",
}: {
  titulo: string;
  subtitulo?: string;
  acoes?: ReactNode;
  children: ReactNode;
  largura?: string;
}) {
  const [aberto, setAberto] = useState(false);
  const { perfil, autenticado } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const encerrarSessao = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await sair();
    await navigate({ to: "/auth", replace: true });
  };

  useEffect(() => setAberto(false), [pathname]);

  useEffect(() => {
    if (!aberto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aberto]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 glass-bar">
        <div
          className={cn("mx-auto flex items-center gap-3 px-4 py-3 sm:px-5", largura)}
        >
          <button
            type="button"
            onClick={() => setAberto(true)}
            aria-label="Abrir menu"
            aria-expanded={aberto}
            className="glass-btn flex shrink-0 items-center gap-2 px-3 py-2 text-xs font-semibold tracking-wide text-steel"
          >
            <MenuIcon aria-hidden="true" className="size-4" strokeWidth={1.75} />
            <span className="hidden sm:inline">MENU</span>
          </button>

          <img
            src={marcaCCO.url}
            alt=""
            aria-hidden="true"
            className="size-9 shrink-0 object-contain"
          />

          <div className="min-w-0 leading-tight">
            <h1 className="truncate font-display text-xl text-foreground">{titulo}</h1>
            {subtitulo ? (
              <p className="truncate font-mono text-[11px] uppercase tracking-wide text-steel2">
                {subtitulo}
              </p>
            ) : null}
          </div>

          {acoes ? <div className="ml-auto flex flex-wrap items-center gap-2">{acoes}</div> : null}
        </div>
      </header>

      {/* Overlay */}
      <div
        onClick={() => setAberto(false)}
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-40 bg-shell/50 backdrop-blur-[2px] transition-opacity duration-200",
          aberto ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Menu lateral */}
      <nav
        aria-label="Navegação principal"
        aria-hidden={!aberto}
        className={cn(
          "glass-drawer fixed inset-y-0 left-0 z-50 flex w-[86vw] max-w-[19rem] flex-col transition-transform duration-200 ease-out",
          aberto ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-3 border-b border-line px-4 py-4">
          <img
            src={marcaCCO.url}
            alt="Símbolo do CCO TRINDADE"
            className="size-12 shrink-0 object-contain"
          />
          <div className="min-w-0">
            <span className="block font-display text-2xl leading-none text-foreground">CCO TRINDADE</span>
            <span className="block text-[9px] uppercase text-steel2">Centro de Controle Operacional</span>
          </div>
          <button
            type="button"
            onClick={() => setAberto(false)}
            aria-label="Fechar menu"
            className="ml-auto rounded-md px-2 py-1 text-steel2 transition-colors hover:text-foreground"
          >
            <X aria-hidden="true" className="size-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="border-b border-line px-4 py-3">
          {autenticado ? (
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-foreground">
                  {perfil?.full_name ?? "Usuário"}
                </p>
                <p className="truncate font-mono text-[10px] uppercase text-steel2">
                  {perfil?.username ?? ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void encerrarSessao()}
                aria-label="Sair"
                className="rounded-md px-2 py-1 text-steel2 transition-colors hover:text-danger"
              >
                <LogOut aria-hidden="true" className="size-4" strokeWidth={1.75} />
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="block rounded-md bg-signal/15 px-3 py-2 text-center font-mono text-[10px] uppercase tracking-wide text-signal ring-1 ring-signal/35"
            >
              Entrar
            </Link>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          {GRUPOS.map((g) => (
            <div key={g.titulo} className="mb-5">
              <p className="mb-2 px-2 font-mono text-[10px] uppercase tracking-[0.14em] text-steel2">
                {g.titulo}
              </p>
              <ul className="space-y-1">
                {g.itens.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      activeOptions={{ exact: item.to === "/" }}
                      className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-steel transition-colors hover:bg-panel2/60 hover:text-foreground"
                      activeProps={{
                        className:
                          "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm bg-signal/15 text-signal ring-1 ring-signal/35",
                      }}
                    >
                      <item.Icone
                        aria-hidden="true"
                        className="size-4 shrink-0"
                        strokeWidth={1.75}
                      />
                      <span className="min-w-0 flex-1 truncate">{item.rotulo}</span>
                      {item.detalhe ? (
                        <span className="shrink-0 font-mono text-[9px] uppercase tracking-wide text-steel2">
                          {item.detalhe}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      <main className={cn("mx-auto px-4 py-5 sm:px-5", largura)}>{children}</main>
    </div>
  );
}
