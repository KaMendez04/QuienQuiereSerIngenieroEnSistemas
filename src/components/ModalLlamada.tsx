import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Phone, PhoneCall } from "lucide-react";
import { LETRAS } from "../game/tipos";
import type { SugerenciaAmigo } from "../game/tipos";

const DURACION_LLAMADA_S = 30;

interface ModalLlamadaProps {
  sugerencia: SugerenciaAmigo | null;
  onCerrar?: () => void;
}

export const ModalLlamada: React.FC<ModalLlamadaProps> = ({
  sugerencia,
  onCerrar,
}) => {
  /* La llamada dura 30 segundos: el amigo habla y al agotarse el tiempo
   * la conversación se corta sola. */
  const [restante, setRestante] = useState(DURACION_LLAMADA_S);

  useEffect(() => {
    if (!sugerencia) return;
    setRestante(DURACION_LLAMADA_S);
    const intervalo = setInterval(() => {
      setRestante((t) => {
        if (t <= 1) {
          clearInterval(intervalo);
          onCerrar?.();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sugerencia]);

  const urgente = restante <= 10;

  if (!sugerencia) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-md p-6 rounded-2xl border-2 border-cyan-400 bg-gradient-to-b from-[#0f1747] via-[#080d30] to-[#030617] shadow-[0_0_40px_rgba(0,180,255,0.6)] text-center"
      >
        {onCerrar && (
          <button
            onClick={onCerrar}
            className="absolute top-3 right-3 p-1 rounded-full text-cyan-300 hover:text-white hover:bg-cyan-500/20 text-xs font-bold"
          >
            ✕
          </button>
        )}

        {/* Temporizador circular de la llamada */}
        <div
          className={`absolute -top-5 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full border-2 flex items-center justify-center font-black text-base tabular-nums shadow-lg transition-colors duration-500 ${
            urgente
              ? "border-rose-400 text-rose-300 bg-rose-950/90 animate-pulse"
              : "border-cyan-400 text-cyan-200 bg-blue-950/90"
          }`}
          title="La llamada se corta cuando el tiempo se agota"
        >
          {restante}
        </div>

        <div className="flex items-center justify-center gap-2 mb-4 mt-2">
          <PhoneCall className="text-cyan-400 animate-pulse" size={26} />
          <h3 className="text-xl font-black uppercase tracking-wider text-cyan-200">
            Llamada al Amigo
          </h3>
        </div>

        <div className="px-4 py-5 mb-4 rounded-2xl bg-blue-950/80 border border-cyan-500/40">
          <Phone className="mx-auto text-cyan-400 mb-3" size={28} />
          <p className="text-sm text-gray-100 leading-relaxed mb-3">
            «Hola... yo que tú, marcaría la{" "}
            <strong className="text-amber-300 font-black text-lg">
              {LETRAS[sugerencia.index]}
            </strong>
            . Estoy como un{" "}
            <strong className="text-amber-300 font-black">
              {sugerencia.confianza}%
            </strong>{" "}
            seguro.»
          </p>
        </div>

        <button
          onClick={onCerrar}
          className="px-6 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-black text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          Colgar
        </button>
      </motion.div>
    </div>
  );
};
