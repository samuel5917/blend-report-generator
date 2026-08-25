import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Section({
  titulo,
  resumo,
  open,
  onToggle,
  children,
}: {
  numero?: string;
  titulo: string;
  resumo?: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl bg-panel ring-1 ring-line">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
      >
        <span className="text-[15px] font-semibold text-foreground">{titulo}</span>
        {resumo ? <span className="text-[12px] text-steel2">{resumo}</span> : null}
        <span className={cn("ml-auto text-steel2 transition-transform", !open && "-rotate-90")}>
          ▾
        </span>
      </button>
      <div className={open ? "sec-body" : "sec-body-closed"}>
        <div>
          <div className="px-4 pb-4">{children}</div>
        </div>
      </div>
    </section>
  );
}


export function Label({ children }: { children: ReactNode }) {
  return (
    <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-wide text-steel2">
      {children}
    </span>
  );
}

const fieldClass =
  "w-full rounded-md bg-panel2 px-3 py-2 text-sm text-foreground ring-1 ring-line outline-none focus:ring-signal/60 placeholder:text-steel2";

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  className,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      {label ? <Label>{label}</Label> : null}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={cn(fieldClass, "font-mono")}
      />
    </label>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 2,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      {label ? <Label>{label}</Label> : null}
      <textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={cn(fieldClass, "resize-y")}
      />
    </label>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "Selecione…",
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder?: string;
}) {
  return (
    <label className="block">
      {label ? <Label>{label}</Label> : null}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(fieldClass, "appearance-none")}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Chip({
  children,
  active,
  onClick,
  tone = "signal",
  size = "md",
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  tone?: "signal" | "neutral";
  size?: "sm" | "md";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md ring-1 transition-colors",
        size === "sm" ? "px-2 py-1 text-[11px]" : "px-2.5 py-1 text-xs",
        active
          ? tone === "signal"
            ? "bg-signal/20 text-signal ring-signal/50"
            : "bg-panel2 text-foreground ring-line"
          : "text-steel ring-line hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

export function ActionButton({
  children,
  onClick,
  variant = "ghost",
  className,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger";
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        "rounded-md px-3 py-2 text-xs font-semibold tracking-wide transition-colors",
        variant === "primary" &&
          "bg-signal text-signal-foreground ring-1 ring-signal/60 hover:brightness-110",
        variant === "ghost" && "text-steel ring-1 ring-line hover:text-foreground",
        variant === "danger" && "text-danger ring-1 ring-danger/40 hover:bg-danger/10",
        className,
      )}
    >
      {children}
    </button>
  );
}
