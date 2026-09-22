﻿import { motion } from "framer-motion";
import { LETRAS, type Resultado } from "../game/tipos";

interface OpcionProps {
  index: number;
  texto: string;
  eliminada: boolean;
  seleccionada: boolean;
  revelada: boolean;
  esCorrecta: boolean;
  resultado: Resultado | null;
  porcentajeAudiencia: number | null;
  tension: boolean;
  onClick?: () => void;
  compacta?: boolean;
}

export function Opcion({
  index,
  texto,
  eliminada,
  seleccionada,
  revelada,
  esCorrecta,
  resultado,
  porcentajeAudiencia,
  tension,
  onClick,
  compacta = false,
}: OpcionProps) {
  const tam = compacta
    ? "px-4 py-2 text-base"
    : "px-6 py-3.5 text-xl md:text-2xl";

  let borde = "border-mq-line";
  let fondo = "bg-gradient-to-b from-mq-panel2 to-mq-panel";
  let texto2 = "text-white";

  if (eliminada) {
    borde = "border-transparent";
    fondo = "bg-black/40";
    texto2 = "text-white/40 line-through";
  } else if (revelada && resultado && esCorrecta) {
    borde = "border-green-400";
    fondo = "bg-gradient-to-b from-green-600/80 to-green-800/80";
    texto2 = "text-white";
  } else if (revelada && resultado && seleccionada && !esCorrecta) {
    borde = "border-red-500";
    fondo = "bg-gradient-to-b from-red-700/80 to-red-900/80";
    texto2 = "text-white";
  } else if (revelada && resultado) {
    borde = "border-transparent";
    fondo = "bg-black/30";
    texto2 = "text-white/60";
  } else if (seleccionada) {
    borde = "border-mq-goldlight";
    fondo = "bg-gradient-to-b from-mq-gold/25 to-mq-panel";
    texto2 = "text-white";
  }

  const claseTension =
    tension && seleccionada && !revelada ? "animate-tension" : "";

  return (
    <motion.button
      type="button"
      disabled={eliminada || revelada || !onClick}
      onClick={onClick}
      whileHover={
        onClick && !eliminada && !revelada ? { scale: 1.015 } : undefined
      }
      whileTap={onClick ? { scale: 0.985 } : undefined}
      className={`group relative flex w-full items-center border-2 ${borde} ${fondo} ${texto2} ${tam} ${claseTension} transition-colors duration-150 disabled:cursor-default
        ${!eliminada && !revelada && !seleccionada ? "shadow-gold-inner hover:border-mq-gold" : ""}`}
      style={{
        clipPath: "polygon(3% 0, 97% 0, 100% 50%, 97% 100%, 3% 100%, 0 50%)",
      }}
    >
      <span className="mr-2 md:mr-3 font-black text-white drop-shadow-[0_0_6px_rgba(0,0,0,0.9)]">
        {LETRAS[index]}
      </span>
      <span className="flex-1 text-left font-semibold leading-snug">
        {texto}
      </span>
      {porcentajeAudiencia !== null && (
        <span className="ml-3 font-black text-white tabular-nums">
          {porcentajeAudiencia}%
        </span>
      )}
      {revelada && esCorrecta && (
        <span className="ml-3 font-black text-green-300">✓</span>
      )}
      {revelada && seleccionada && !esCorrecta && (
        <span className="ml-3 font-black text-red-300">✕</span>
      )}
    </motion.button>
  );
}
