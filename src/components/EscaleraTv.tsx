import React from "react";
import { ESCALERA } from "../game/escalera";

interface EscaleraTvProps {
  nivelActual: number;
}

export const EscaleraTv: React.FC<EscaleraTvProps> = ({ nivelActual }) => {
  return (
    <div
      className="relative flex flex-col w-56 md:w-64 p-3 rounded-xl select-none"
      style={{
        background: "linear-gradient(180deg, rgba(8, 12, 45, 0.9) 0%, rgba(2, 4, 20, 0.95) 100%)",
        border: "2px solid #526fbf",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.8), inset 0 0 12px rgba(80, 130, 255, 0.2)",
      }}
    >
      <div className="flex flex-col gap-0.5">
        {ESCALERA.map((item) => {
          const esActivo = item.nivel === nivelActual;
          const esSuperado = item.nivel < nivelActual;
          const esSeguro = item.esSeguro;

          // Colores de texto según el estado e importancia
          let colorNumero = "text-amber-500";
          let colorTexto = "text-white";
          let colorRombo = "text-amber-400";

          if (esSeguro) {
            colorNumero = "text-amber-400 font-extrabold";
            colorTexto = "text-white font-extrabold";
            colorRombo = "text-white";
          } else if (esSuperado) {
            colorNumero = "text-amber-600";
            colorTexto = "text-amber-200/80";
            colorRombo = "text-amber-500";
          } else if (!esActivo) {
            colorNumero = "text-amber-500/80";
            colorTexto = "text-white/80";
            colorRombo = "text-amber-400/60";
          }

          return (
            <div
              key={item.nivel}
              className={`relative flex items-center justify-between px-2.5 py-0.5 text-xs md:text-sm font-bold transition-all duration-300 ${
                esActivo
                  ? "hex-lozenge-sm bg-gradient-to-r from-blue-900/90 via-blue-700/90 to-blue-900/90 text-white shadow-[0_0_12px_rgba(255,200,50,0.9)] border-y border-amber-300 font-black scale-105 z-10"
                  : ""
              }`}
            >
              {/* Lado Izquierdo: Número de nivel */}
              <span className={`w-6 text-right ${esActivo ? "text-amber-300 font-black" : colorNumero}`}>
                {item.nivel}
              </span>

              {/* Centro: Rombo/Diamante icónico */}
              <span className={`mx-1 text-[9px] ${esActivo ? "text-amber-300" : colorRombo}`}>
                ◆
              </span>

              {/* Lado Derecho: Etiqueta especial o Premio */}
              <span
                className={`flex-1 text-right tracking-wide truncate ${
                  esActivo ? "text-white font-black drop-shadow-[0_0_4px_rgba(255,255,255,0.9)]" : colorTexto
                }`}
              >
                {item.etiquetaEspecial || item.premio}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
