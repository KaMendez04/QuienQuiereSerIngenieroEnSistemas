import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Award, Shield, CheckCircle2 } from "lucide-react";
import { ESCALERA } from "../game/escalera";

interface ModalEscaleraProps {
  abierto: boolean;
  nivelActual: number;
  onCerrar: () => void;
}

export const ModalEscalera: React.FC<ModalEscaleraProps> = ({
  abierto,
  nivelActual,
  onCerrar,
}) => {
  if (!abierto) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 rounded-3xl border-2 border-cyan-400 bg-gradient-to-b from-[#0e1644] via-[#070b28] to-[#020412] shadow-[0_0_50px_rgba(0,180,255,0.7)] text-white"
        >
          {/* Botón Cerrar / Volver a la Pregunta */}
          <button
            onClick={onCerrar}
            className="absolute top-4 right-4 p-2 rounded-full text-cyan-300 hover:text-white bg-blue-950/80 hover:bg-cyan-500/20 border border-cyan-400/40 transition-all cursor-pointer"
            title="Volver al juego"
          >
            <X size={20} />
          </button>

          {/* Encabezado del Modal */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <Award className="text-amber-400" size={28} />
            <h2 className="text-xl font-black uppercase tracking-wider text-amber-300 text-center">
              Escalera de Etapas y Premios
            </h2>
          </div>

          <p className="text-xs text-center text-cyan-200/80 mb-4">
            Avanza respondiendo correctamente para alcanzar el título de <strong>Ingeniero Senior</strong>.
          </p>

          {/* Lista de Niveles / Etapas */}
          <div className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto pr-1">
            {ESCALERA.map((item) => {
              const esActivo = item.nivel === nivelActual;
              const esSuperado = item.nivel < nivelActual;
              const esSeguro = item.esSeguro;

              let estiloFondo = "bg-blue-950/40 border-blue-900/60 text-gray-300";
              let estiloNumero = "text-amber-500";
              let estiloTexto = "text-white";

              if (esActivo) {
                estiloFondo = "bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 border-amber-300 text-white shadow-[0_0_15px_rgba(255,200,50,0.8)] font-black scale-[1.02] z-10";
                estiloNumero = "text-amber-300 font-black";
                estiloTexto = "text-white font-black";
              } else if (esSuperado) {
                estiloFondo = "bg-emerald-950/40 border-emerald-800/40 text-emerald-200";
                estiloNumero = "text-emerald-400";
                estiloTexto = "text-emerald-100";
              } else if (esSeguro) {
                estiloFondo = "bg-amber-950/30 border-amber-500/50 text-amber-200 font-bold";
                estiloNumero = "text-amber-400 font-black";
                estiloTexto = "text-white font-black";
              }

              return (
                <div
                  key={item.nivel}
                  className={`flex items-center justify-between px-3.5 py-1.5 rounded-xl border transition-all text-xs md:text-sm ${estiloFondo}`}
                >
                  <div className="flex items-center gap-2">
                    {esSuperado ? (
                      <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                    ) : esSeguro ? (
                      <Shield size={15} className="text-amber-400 shrink-0" />
                    ) : (
                      <span className={`w-4 text-center font-bold ${estiloNumero}`}>
                        {item.nivel}
                      </span>
                    )}
                    <span className="font-bold">{item.titulo}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.etiquetaEspecial && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/40">
                        {item.etiquetaEspecial}
                      </span>
                    )}
                    <span className={`font-mono font-extrabold ${estiloTexto}`}>
                      {item.premio}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botón para volver directamente a la pantalla de juego */}
          <div className="mt-5 text-center">
            <button
              onClick={onCerrar}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,180,255,0.6)] transition-all cursor-pointer"
            >
              ← Volver a la Pregunta
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
