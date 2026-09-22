import React from "react";
import { LETRAS, type Resultado } from "../game/tipos";

interface BotonRespuestaTvProps {
  index: number;
  texto: string;
  eliminada: boolean;
  seleccionada: boolean;
  revelada: boolean;
  esCorrecta: boolean;
  resultado: Resultado | null;
  porcentajeAudiencia: number | null;
  onClick?: () => void;
  deshabilitado?: boolean;
}

export const BotonRespuestaTv: React.FC<BotonRespuestaTvProps> = ({
  index,
  texto,
  eliminada,
  seleccionada,
  revelada,
  esCorrecta,
  resultado,
  porcentajeAudiencia,
  onClick,
  deshabilitado = false,
}) => {
  const letra = LETRAS[index];

  // Determinar clases visuales según el estado del juego
  let estiloContenedor = "border-[#4a6baf] bg-gradient-to-b from-[#0e164d] via-[#080d33] to-[#03061c] text-white";
  let estiloLetra = "text-amber-400";

  if (eliminada) {
    return (
      <div className="relative flex items-center w-full min-h-[52px] md:min-h-[64px] opacity-20 pointer-events-none select-none">
        <div className="w-full h-full hex-lozenge bg-[#030517] border border-gray-800" />
      </div>
    );
  }

  if (revelada) {
    if (esCorrecta) {
      estiloContenedor = "border-emerald-300 bg-emerald-600 text-white animate-correct";
      estiloLetra = "text-white font-black";
    } else if (seleccionada && !esCorrecta) {
      estiloContenedor = "border-rose-300 bg-rose-600 text-white animate-wrong";
      estiloLetra = "text-white font-black";
    } else {
      estiloContenedor = "border-[#202b5c] bg-[#04061a] text-gray-400 opacity-60";
      estiloLetra = "text-amber-600";
    }
  } else if (seleccionada) {
    estiloContenedor = "border-amber-300 bg-gradient-to-b from-amber-600 via-amber-700 to-amber-900 text-white animate-tension";
    estiloLetra = "text-white font-black";
  }

  return (
    <div className="relative flex items-center w-full group">
      {/* Línea horizontal metálica exterior izquierda */}
      <div className="hidden lg:block w-4 h-[2px] bg-gradient-to-r from-blue-400/80 to-blue-200" />

      {/* Botón Principal Hexagonal Lozenge */}
      <button
        type="button"
        disabled={deshabilitado || eliminada || (revelada && resultado !== null)}
        onClick={onClick}
        className={`relative flex-1 flex items-center px-6 md:px-8 py-3 md:py-3.5 min-h-[54px] md:min-h-[64px] hex-lozenge transition-all duration-200 select-none ${estiloContenedor} ${
          !deshabilitado && !seleccionada && !revelada
            ? "hover:brightness-125 hover:border-cyan-300 cursor-pointer shadow-[0_0_15px_rgba(20,90,240,0.4)]"
            : ""
        }`}
        style={{
          borderWidth: "2px",
          borderStyle: "solid",
        }}
      >
        {/* Doble borde interior */}
        <div className="absolute inset-[3px] hex-lozenge border border-white/20 pointer-events-none" />

        {/* Viñeta: Diamante + Letra */}
        <div className="flex items-center gap-1.5 mr-3 shrink-0">
          <span className={`text-xs md:text-sm ${estiloLetra}`}>◆</span>
          <span className={`text-base md:text-xl font-black ${estiloLetra}`}>
            {letra}:
          </span>
        </div>

        {/* Texto de la respuesta */}
        <span className="flex-1 text-left text-sm md:text-lg font-bold leading-tight tracking-wide drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
          {texto}
        </span>

        {/* Porcentaje de votación del público (si se usó el comodín) */}
        {porcentajeAudiencia !== null && (
          <span className="ml-2 px-2 py-0.5 rounded bg-blue-950/80 border border-cyan-400 text-cyan-200 text-xs md:text-sm font-black tabular-nums">
            {porcentajeAudiencia}%
          </span>
        )}

        {/* Icono de estado al revelar */}
        {revelada && esCorrecta && (
          <span className="ml-2 text-white font-black text-xl drop-shadow-[0_0_8px_rgba(255,255,255,1)]">
            ✓
          </span>
        )}
        {revelada && seleccionada && !esCorrecta && (
          <span className="ml-2 text-white font-black text-xl drop-shadow-[0_0_8px_rgba(255,255,255,1)]">
            ✕
          </span>
        )}
      </button>

      {/* Línea horizontal metálica exterior derecha */}
      <div className="hidden lg:block w-4 h-[2px] bg-gradient-to-r from-blue-200 to-blue-400/80" />
    </div>
  );
};
