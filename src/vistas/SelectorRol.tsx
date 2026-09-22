import React from "react";
import { Link } from "react-router-dom";
import { LogoMillonario } from "../components/LogoMillonario";
import { UserCheck, Tv, ShieldCheck } from "lucide-react";

export const SelectorRol: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-studio text-white p-4">
      {/* Contenedor Central */}
      <div className="relative flex flex-col items-center max-w-2xl w-full p-8 rounded-3xl border-2 border-blue-600/60 bg-gradient-to-b from-[#0e174a] via-[#080d33] to-[#03051c] shadow-[0_0_50px_rgba(0,100,255,0.5)] text-center">
        {/* Logotipo Central del Concurso */}
        <LogoMillonario size={200} textoPrincipal="MILLONARIO" className="mb-4" />

        <h1 className="text-2xl md:text-4xl font-black uppercase tracking-wider text-amber-300 drop-shadow-[0_2px_10px_rgba(255,180,0,0.6)] mb-2">
          ¿Quién Quiere Ser Ingeniero en Sistemas?
        </h1>
        <p className="text-sm md:text-base text-cyan-200/80 mb-8 max-w-lg">
          Selecciona tu rol para acceder a la partida en tiempo real.
        </p>

        {/* Tarjetas de Selección de Rol */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
          {/* ROL: PARTICIPANTE */}
          <Link
            to="/participante"
            className="group relative flex flex-col items-center p-6 rounded-2xl border-2 border-cyan-400 bg-gradient-to-b from-blue-900/60 to-blue-950/80 hover:border-cyan-300 hover:from-blue-800 hover:to-blue-900 shadow-[0_0_20px_rgba(0,180,255,0.4)] hover:shadow-[0_0_35px_rgba(0,220,255,0.8)] transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="p-4 rounded-full bg-cyan-500/20 text-cyan-300 mb-3 group-hover:scale-110 transition-transform">
              <Tv size={36} />
            </div>
            <h2 className="text-xl font-black uppercase tracking-wider text-white mb-1">
              Participante
            </h2>
            <span className="text-xs text-cyan-200/80">
              Pantalla del concursante · Elige comodines y responde las preguntas
            </span>
          </Link>

          {/* ROL: ADMINISTRADOR */}
          <Link
            to="/admin"
            className="group relative flex flex-col items-center p-6 rounded-2xl border-2 border-amber-400 bg-gradient-to-b from-amber-950/40 to-[#120f26] hover:border-amber-300 hover:from-amber-900/50 hover:to-[#1a143b] shadow-[0_0_20px_rgba(255,180,0,0.4)] hover:shadow-[0_0_35px_rgba(255,200,0,0.8)] transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="p-4 rounded-full bg-amber-500/20 text-amber-300 mb-3 group-hover:scale-110 transition-transform">
              <UserCheck size={36} />
            </div>
            <h2 className="text-xl font-black uppercase tracking-wider text-white mb-1">
              Administrador
            </h2>
            <span className="text-xs text-amber-200/80">
              Presentador del show · Lee las preguntas, verifica respuestas y guía el concurso
            </span>
          </Link>
        </div>

        <div className="mt-8 text-xs text-gray-400 flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-400" />
          Sincronización en tiempo real activa entre dispositivos y pestañas
        </div>
      </div>
    </div>
  );
};
