import React, { useState } from "react";
import { useSincronizacion } from "../hooks/useSincronizacion";
import { useSonidos } from "../hooks/useSonidos";
import { ESCALERA } from "../game/escalera";
import { LETRAS } from "../game/tipos";
import { LogoMillonario } from "../components/LogoMillonario";
import { ModalEscalera } from "../components/ModalEscalera";
import {
  Play,
  Eye,
  ChevronRight,
  RotateCcw,
  BarChart3,
  HelpCircle,
  Tv,
} from "lucide-react";
import { Link } from "react-router-dom";

export const VistaAdministrador: React.FC = () => {
  const { estado, emitir, preguntaActual, banco } = useSincronizacion("admin");
  const reproducir = useSonidos();
  const [mostrarModalEscalera, setMostrarModalEscalera] = useState(false);

  const nivelInfo = ESCALERA.find((e) => e.nivel === estado.nivel);

  const cargarPreguntaNivel = () => {
    const primera = banco.find((p) => p.nivel === estado.nivel);
    if (primera) {
      reproducir("tic");
      emitir({
        type: "AVANZAR_PREGUNTA",
        preguntaId: primera.id,
        nivel: estado.nivel,
      });
    }
  };

  const iniciarTiempo = () => {
    reproducir("tic");
    emitir({ type: "INICIAR_TIEMPO" });
  };

  const revelarRespuesta = () => {
    if (!preguntaActual) return;
    emitir({
      type: "REVELAR_RESPUESTA",
      correctaIndex: preguntaActual.correctaIndex,
    });
  };

  const avanzarSiguienteNivel = () => {
    if (estado.nivel >= 15) return;
    const siguienteNivel = estado.nivel + 1;
    const siguientePregunta = banco.find((p) => p.nivel === siguienteNivel);
    if (siguientePregunta) {
      reproducir("nivel");
      emitir({
        type: "SIGUIENTE_NIVEL",
        preguntaId: siguientePregunta.id,
        nivel: siguienteNivel,
      });
    }
  };

  const reiniciarPartida = () => {
    if (window.confirm("¿Seguro que deseas reiniciar el juego al Nivel 1?")) {
      emitir({ type: "REINICIAR_JUEGO" });
    }
  };

  return (
    <div className="relative flex flex-col justify-between min-h-screen w-full bg-studio overflow-hidden p-2 md:p-4 text-white">
      {/* Rayo de luz horizontal central del estudio */}
      <div className="absolute top-1/2 left-0 right-0 h-1 horizontal-beam pointer-events-none z-0" />

      {/* MODAL ESCALERA DE ETAPAS */}
      <ModalEscalera
        abierto={mostrarModalEscalera}
        nivelActual={estado.nivel}
        onCerrar={() => setMostrarModalEscalera(false)}
      />

      {/* HEADER COMPACTO DEL ADMINISTRADOR CON EL ESTILO DEL SHOW */}
      <header className="relative z-10 flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-gradient-to-r from-[#0a103c]/90 via-[#070b28]/95 to-[#0a103c]/90 backdrop-blur-md rounded-2xl border-2 border-amber-500/60 shadow-[0_4px_25px_rgba(255,180,0,0.2)]">
        {/* LADO IZQUIERDO: BADGE DE CONSOLA DE PRESENTADOR */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 text-black rounded-xl shadow-[0_0_12px_rgba(255,180,0,0.6)]">
            Consola del Presentador
          </span>
          <span className="text-xs font-bold text-cyan-300">
            Nivel {estado.nivel}/15 · <strong className="text-amber-300">{nivelInfo?.premio}</strong>
          </span>
        </div>

        {/* CENTRO: LOGO COMPACTO Y TÍTULO */}
        <div className="flex items-center gap-3">
          <LogoMillonario size={54} textoPrincipal="INGENIERO" />
          <div className="text-center">
            <h1 className="text-sm md:text-base font-black uppercase tracking-wider text-amber-300">
              ¿Quién Quiere Ser Ingeniero en Sistemas?
            </h1>
            <span className="text-[10px] font-bold text-cyan-200/80">
              Teleprompter y Control del Juego en Vivo
            </span>
          </div>
        </div>

        {/* LADO DERECHO: VER ETAPAS Y VISTA PARTICIPANTE */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMostrarModalEscalera(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-cyan-200 bg-blue-900/80 hover:bg-blue-800 border border-cyan-400/40 rounded-xl transition-all cursor-pointer"
          >
            <BarChart3 size={15} /> Ver Etapas
          </button>
          <Link
            to="/participante"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-cyan-200 bg-blue-950 hover:bg-blue-900 border border-blue-700 rounded-xl transition-all"
            title="Abrir pantalla del jugador"
          >
            <Tv size={14} /> Pantalla Jugador
          </Link>
        </div>
      </header>

      {/* TARJETA PRINCIPAL DEL PRESENTADOR ESTILO TV */}
      <main className="relative z-10 flex flex-col items-center justify-center flex-1 w-full max-w-5xl mx-auto my-3 md:my-5">
        {preguntaActual ? (
          <div className="flex flex-col items-center w-full gap-4">
            {/* CAJA DE PREGUNTA CON BORDE METÁLICO Y RESPLANDOR */}
            <div
              className="relative flex items-center justify-center w-full px-8 md:px-14 py-5 md:py-6 hex-lozenge text-center select-none shadow-[0_0_30px_rgba(20,60,180,0.6)]"
              style={{
                background:
                  "linear-gradient(180deg, #10195e 0%, #080e3b 50%, #03051e 100%)",
                border: "2.5px solid #5a7fd8",
              }}
            >
              <div className="absolute inset-[3px] hex-lozenge border border-cyan-400/30 pointer-events-none" />
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300">
                  {preguntaActual.categoria === "carrera" ? "Ingeniería en Sistemas" : "Lógica"}
                </span>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-white leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                  "{preguntaActual.texto}"
                </h2>
              </div>
            </div>

            {/* LAS 4 RESPUESTAS EN ESTILO HEXAGONAL CON LA CORRECTA ILUMINADA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
              {preguntaActual.opciones.map((opc, i) => {
                const esCorrecta = preguntaActual.correctaIndex === i;
                const seleccionadaPorParticipante = estado.opcionSeleccionada === i;
                const eliminadaPor5050 = estado.opcionesEliminadas.includes(i);

                let estiloBordeFondo = "border-[#4a6baf] bg-gradient-to-b from-[#0e164d] via-[#080d33] to-[#03061c] text-white";
                let estiloLetra = "text-amber-400";

                if (esCorrecta) {
                  estiloBordeFondo = "border-emerald-300 bg-emerald-700/90 text-white shadow-[0_0_20px_rgba(52,211,153,0.7)]";
                  estiloLetra = "text-white font-black";
                } else if (seleccionadaPorParticipante) {
                  estiloBordeFondo = "border-amber-400 bg-amber-900/80 text-amber-100";
                  estiloLetra = "text-amber-300 font-black";
                }

                return (
                  <div
                    key={i}
                    className={`relative flex items-center px-6 py-3.5 hex-lozenge border-2 transition-all ${estiloBordeFondo} ${
                      eliminadaPor5050 ? "opacity-30 line-through" : ""
                    }`}
                  >
                    <div className="absolute inset-[2px] hex-lozenge border border-white/10 pointer-events-none" />

                    <div className="flex items-center gap-1.5 mr-3 shrink-0">
                      <span className={`text-xs ${estiloLetra}`}>◆</span>
                      <span className={`text-base font-black ${estiloLetra}`}>
                        {LETRAS[i]}:
                      </span>
                    </div>

                    <span className="flex-1 text-left text-base font-bold drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                      {opc}
                    </span>

                    {/* BADGES CLAROS */}
                    {esCorrecta && (
                      <span className="px-2.5 py-0.5 text-[11px] font-black uppercase text-emerald-900 bg-emerald-200 rounded-md shrink-0 shadow">
                        ✓ CORRECTA
                      </span>
                    )}
                    {seleccionadaPorParticipante && !esCorrecta && (
                      <span className="px-2 py-0.5 text-[10px] font-black uppercase text-amber-200 bg-amber-950/90 border border-amber-500 rounded shrink-0">
                        Marcó el Concursante
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ESTADO EN VIVO DEL PARTICIPANTE Y COMODINES */}
            <div className="flex flex-wrap items-center justify-between gap-3 w-full px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#090f38]/90 via-[#060a28]/95 to-[#090f38]/90 border border-blue-700/60 text-xs md:text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-300 font-bold">Concursante:</span>
                <span className="font-black text-amber-300">
                  {estado.opcionSeleccionada !== null
                    ? `Opción ${LETRAS[estado.opcionSeleccionada]}`
                    : "Pensando..."}
                </span>
                {estado.respuestaConfirmada && (
                  <span className="px-2 py-0.5 text-[11px] font-black uppercase bg-emerald-950 text-emerald-300 border border-emerald-500 rounded-md">
                    🔒 Confirmada (Última palabra)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-300 font-semibold">
                <span>Comodines usados:</span>
                {estado.comodinesUsados.cincuentaCincuenta && (
                  <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-600">50:50</span>
                )}
                {estado.comodinesUsados.preguntaAudiencia && (
                  <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-600">Público</span>
                )}
                {estado.comodinesUsados.consultaProfesor && (
                  <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-600">Profesor</span>
                )}
                {!estado.comodinesUsados.cincuentaCincuenta && !estado.comodinesUsados.preguntaAudiencia && !estado.comodinesUsados.consultaProfesor && (
                  <span className="text-gray-400 italic">Ninguno</span>
                )}
              </div>
            </div>

            {/* BOTONES DE CONTROL SECUENCIALES DEL PRESENTADOR */}
            <div className="flex flex-wrap items-center justify-center gap-4 w-full pt-2">
              <button
                type="button"
                disabled={estado.tiempoCorriendo || estado.respuestaConfirmada}
                onClick={iniciarTiempo}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 font-black text-xs md:text-sm uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(37,99,235,0.6)] cursor-pointer hover:scale-105 active:scale-95"
              >
                <Play size={16} /> 1. Iniciar Tiempo
              </button>

              <button
                type="button"
                disabled={!estado.respuestaConfirmada || estado.respuestaRevelada}
                onClick={revelarRespuesta}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-black disabled:opacity-40 font-black text-xs md:text-sm uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,180,0,0.7)] cursor-pointer hover:scale-105 active:scale-95"
              >
                <Eye size={16} /> 2. Revelar Respuesta
              </button>

              {estado.nivel < 15 && (
                <button
                  type="button"
                  disabled={!estado.respuestaRevelada || estado.resultado !== "correcto"}
                  onClick={avanzarSiguienteNivel}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 font-black text-xs md:text-sm uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(16,185,129,0.6)] cursor-pointer hover:scale-105 active:scale-95"
                >
                  <ChevronRight size={16} /> 3. Siguiente Pregunta
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-blue-700 bg-blue-950/70 text-center shadow-[0_0_30px_rgba(0,50,180,0.5)]">
            <HelpCircle className="text-amber-400 mb-3" size={54} />
            <h2 className="text-2xl font-black uppercase text-white mb-2">
              Iniciar Pregunta del Nivel {estado.nivel}
            </h2>
            <p className="text-cyan-200/80 text-sm max-w-md mb-6">
              Carga la pregunta para que aparezca en pantalla y comiences la lectura al concursante.
            </p>
            <button
              onClick={cargarPreguntaNivel}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(255,180,0,0.8)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              🚀 Cargar Pregunta
            </button>
          </div>
        )}
      </main>

      {/* PIE DE PÁGINA: REINICIAR */}
      <footer className="relative z-10 flex justify-center py-1">
        <button
          onClick={reiniciarPartida}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-red-500/40 bg-red-950/20 hover:bg-red-900/40 text-red-300 text-[11px] font-bold transition-all cursor-pointer"
        >
          <RotateCcw size={12} /> Reiniciar Partida
        </button>
      </footer>
    </div>
  );
};
