import React from "react";
import { Users, LogOut, GraduationCap } from "lucide-react";

export type TipoComodin = "50:50" | "audiencia" | "consulta" | "retirarse";

interface ComodinOvaloProps {
  tipo: TipoComodin;
  usado?: boolean;
  deshabilitado?: boolean;
  onClick?: () => void;
  titulo?: string;
}

export const ComodinOvalo: React.FC<ComodinOvaloProps> = ({
  tipo,
  usado = false,
  deshabilitado = false,
  onClick,
  titulo,
}) => {
  const disabled = usado || deshabilitado;

  const renderIcono = () => {
    switch (tipo) {
      case "50:50":
        return (
          <span className="font-black text-sm md:text-base tracking-tighter text-white drop-shadow-[0_0_8px_rgba(0,200,255,0.8)]">
            50:50
          </span>
        );
      case "audiencia":
        return (
          <div className="flex items-center justify-center text-cyan-300 drop-shadow-[0_0_8px_rgba(0,200,255,0.8)]">
            <Users size={20} strokeWidth={2.4} />
          </div>
        );
      case "consulta":
        return (
          <div className="flex items-center justify-center text-cyan-300 drop-shadow-[0_0_8px_rgba(0,200,255,0.8)]">
            <GraduationCap size={20} strokeWidth={2.4} />
          </div>
        );
      case "retirarse":
        return (
          <div className="flex items-center justify-center gap-0.5 text-cyan-300 drop-shadow-[0_0_8px_rgba(0,200,255,0.8)]">
            <div className="w-3 h-4 border-l-2 border-y-2 border-cyan-300 flex items-center justify-center">
              <span className="text-[8px] font-bold">◀</span>
            </div>
            <LogOut size={18} strokeWidth={2.4} />
          </div>
        );
    }
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={titulo || tipo}
      className={`relative group flex items-center justify-center w-16 h-10 md:w-20 md:h-11 rounded-full transition-all duration-300 select-none ${
        disabled
          ? "opacity-40 cursor-not-allowed filter grayscale"
          : "hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_12px_rgba(40,110,255,0.4)] hover:shadow-[0_0_20px_rgba(0,200,255,0.8)]"
      }`}
      style={{
        background:
          "radial-gradient(ellipse at 50% 30%, #1a2266 0%, #070a2b 75%, #020412 100%)",
        border: "2px solid #89a7df",
        boxShadow: "inset 0 0 6px rgba(0, 180, 255, 0.4)",
      }}
    >
      {/* Doble anillo interior metálico */}
      <div className="absolute inset-[2px] rounded-full border border-cyan-400/40 pointer-events-none" />

      {/* Contenido / Icono */}
      {renderIcono()}

      {/* Marca de usado (Cruz Roja / Barra) */}
      {usado && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-[2px] bg-red-600 shadow-[0_0_8px_rgba(239,68,68,1)] rotate-45" />
          <div className="w-full h-[2px] bg-red-600 shadow-[0_0_8px_rgba(239,68,68,1)] -rotate-45" />
        </div>
      )}
    </button>
  );
};
