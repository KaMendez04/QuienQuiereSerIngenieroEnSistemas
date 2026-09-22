import { motion } from "framer-motion";
import { LETRAS } from "../game/tipos";

interface GraficoAudienciaProps {
  distribucion: number[];
}

export function GraficoAudiencia({ distribucion }: GraficoAudienciaProps) {
  return (
    <div className="grid h-44 grid-cols-4 items-end gap-3 px-4">
      {distribucion.map((p, i) => (
        <div key={i} className="flex h-full flex-col items-center justify-end gap-1">
          <span className="font-black text-mq-goldlight tabular-nums">{p}%</span>
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${Math.max(p, 4)}%` }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="w-full rounded-t-sm bg-gradient-to-t from-mq-panel2 via-mq-line to-mq-gold shadow-gold-inner"
          />
          <span className="font-black text-mq-gold">{LETRAS[i]}</span>
        </div>
      ))}
    </div>
  );
}
