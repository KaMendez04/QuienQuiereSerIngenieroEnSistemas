﻿import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { ESCALERA } from "../game/escalera";

interface EscaleraProps {
  nivelActual: number;
  compacta?: boolean;
}

export function Escalera({ nivelActual, compacta = false }: EscaleraProps) {
  return (
    <ol className={`flex flex-col-reverse ${compacta ? "gap-px" : "gap-0.5"}`}>
      {ESCALERA.map((paso) => {
        const esActual = paso.nivel === nivelActual;
        const superado = paso.nivel < nivelActual;
        const hito = paso.nivel === 5 || paso.nivel === 10 || paso.nivel === 15;
        return (
          <motion.li
            key={paso.nivel}
            layout
            className={`flex items-center ${compacta ? "gap-1.5 px-1 py-0.5 text-[11px]" : "gap-2 px-2 py-1 text-sm md:text-base"} ${
              esActual
                ? "rounded-sm bg-gradient-to-r from-mq-gold to-mq-goldlight font-black text-black shadow-gold-glow"
                : superado
                  ? "text-white/50"
                  : hito
                    ? "font-bold text-white"
                    : "text-white/80"
            }`}
          >
            {esActual && (
              <ChevronRight size={compacta ? 12 : 16} strokeWidth={3} />
            )}
            <span className="w-5 text-right tabular-nums opacity-80">
              {paso.nivel}
            </span>
            <span className="flex-1 truncate text-right">{paso.titulo}</span>
            <span
              className={`rombo ${compacta ? "h-2.5 w-2.5" : "h-3.5 w-3.5"} ${
                esActual
                  ? "bg-black"
                  : superado
                    ? "bg-gray-700"
                    : hito
                      ? "bg-mq-gold shadow-gold-glow"
                      : "bg-mq-golddim"
              }`}
            />
          </motion.li>
        );
      })}
    </ol>
  );
}
