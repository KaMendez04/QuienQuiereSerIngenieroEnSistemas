﻿import { Scissors, GraduationCap, Users } from "lucide-react";
import type { ComodinesUsados } from "../game/tipos";

interface IndicadorComodinesProps {
  comodinesUsados: ComodinesUsados;
  tamano?: "md" | "lg";
}

const COMODINES: {
  key: keyof ComodinesUsados;
  etiqueta: string;
  Icono: typeof Scissors;
}[] = [
  { key: "cincuentaCincuenta", etiqueta: "50:50", Icono: Scissors },
  { key: "consultaProfesor", etiqueta: "Profesor", Icono: GraduationCap },
  { key: "preguntaAudiencia", etiqueta: "Público", Icono: Users },
];

export function IndicadorComodines({
  comodinesUsados,
  tamano = "md",
}: IndicadorComodinesProps) {
  const dim = tamano === "lg" ? "h-16 w-16" : "h-12 w-12 md:h-14 md:w-14";
  const ico = tamano === "lg" ? 26 : 20;

  return (
    <div className="flex justify-center gap-3 md:gap-4">
      {COMODINES.map(({ key, etiqueta, Icono }) => {
        const usado = comodinesUsados[key];
        return (
          <div key={key} className="flex flex-col items-center gap-1">
            <div
              className={`rombo flex ${dim} items-center justify-center ${
                usado
                  ? "bg-gray-800/60 outline outline-1 outline-gray-700"
                  : "bg-gradient-to-b from-mq-goldlight to-mq-gold shadow-gold-glow"
              }`}
            >
              <Icono
                size={ico}
                className={usado ? "text-white/40" : "text-black"}
                strokeWidth={2.5}
              />
            </div>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                usado ? "text-white/40 line-through" : "text-white"
              }`}
            >
              {etiqueta}
            </span>
          </div>
        );
      })}
    </div>
  );
}
