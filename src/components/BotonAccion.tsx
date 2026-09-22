﻿import type { ReactNode } from "react";

interface BotonAccionProps {
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
  variante?: "primario" | "secundario";
}

export function BotonAccion({
  onClick,
  disabled,
  children,
  variante = "primario",
}: BotonAccionProps) {
  const estilos =
    variante === "primario"
      ? "bg-gradient-to-b from-mq-goldlight to-mq-gold text-black shadow-gold-glow hover:brightness-110"
      : "border border-mq-line bg-mq-panel text-white hover:border-mq-gold hover:text-white";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded px-4 py-2 text-sm font-bold uppercase tracking-wider transition-all disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none ${estilos}`}
    >
      {children}
    </button>
  );
}
