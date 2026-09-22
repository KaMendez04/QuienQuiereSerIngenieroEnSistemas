import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, X } from "lucide-react";
import { LETRAS } from "../game/tipos";

interface ModalAudienciaProps {
  distribucion: number[] | null;
  onCerrar?: () => void;
}

export const ModalAudiencia: React.FC<ModalAudienciaProps> = ({
  distribucion,
  onCerrar,
}) => {
  if (!distribucion) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative w-full max-w-md p-6 rounded-2xl border-2 border-cyan-400 bg-gradient-to-b from-[#0f1747] via-[#080d30] to-[#030617] shadow-[0_0_40px_rgba(0,180,255,0.6)]"
        >
          {/* Botón cerrar si se proporciona */}
          {onCerrar && (
            <button
              onClick={onCerrar}
              className="absolute top-3 right-3 p-1 rounded-full text-cyan-300 hover:text-white hover:bg-cyan-500/20"
            >
              <X size={20} />
            </button>
          )}

          {/* Título */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <Users className="text-cyan-400" size={26} />
            <h3 className="text-xl font-black uppercase tracking-wider text-cyan-200">
              Votación del Público
            </h3>
          </div>

          {/* Gráfico de Barras */}
          <div className="grid grid-cols-4 items-end gap-4 h-56 px-2 pb-2 border-b-2 border-cyan-500/40">
            {distribucion.map((porcentaje, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-end h-full gap-2"
              >
                <span className="text-sm font-black text-amber-300 tabular-nums">
                  {porcentaje}%
                </span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(porcentaje * 1.8, 6)}px` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="w-full rounded-t-md bg-gradient-to-t from-blue-700 via-cyan-500 to-amber-300 shadow-[0_0_12px_rgba(0,200,255,0.5)]"
                />
                <div className="w-8 h-8 rounded-full border-2 border-cyan-400 bg-blue-950 flex items-center justify-center font-black text-amber-300 text-sm">
                  {LETRAS[i]}
                </div>
              </div>
            ))}
          </div>

          {/* Pie de modal */}
          <p className="mt-4 text-center text-xs text-cyan-200/70 font-semibold">
            Resultados de la votación en tiempo real del estudio
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
