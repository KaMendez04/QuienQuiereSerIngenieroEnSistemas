import React, { useRef, useState } from "react";
import { useJuegoAdmin } from "../hooks/useSincronizacion";
import { ModalEscalera } from "../components/ModalEscalera";
import { LogoMillonario } from "../components/LogoMillonario";
import { zonaSeguraAlcanzada } from "../game/escalera";
import {
  Eye,
  ChevronRight,
  RotateCcw,
  BarChart3,
  HelpCircle,
  LogOut,
  UserX,
  KeyRound,
  RefreshCw,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useSonidos } from "../hooks/useSonidos";
import { LETRAS } from "../game/tipos";

import { useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

export const VistaAdministrador: React.FC = () => {
  const { estado, emitir, preguntaActual, banco, participanteConectado, codigoPartida, generarCodigo } = useJuegoAdmin();
  const navigate = useNavigate();
  const reproducir = useSonidos();
  const [mostrarModalEscalera, setMostrarModalEscalera] = useState(false);
  /** Confirmación propia (en app, sin diálogos del navegador): null | reiniciar | liberar. */
  const [modalConfirmar, setModalConfirmar] = useState<null | "reiniciar" | "liberar">(null);

  const usadasRef = useRef<Set<string>>(new Set());

  // Elige al azar una pregunta del nivel que no haya salido en esta sesión.
  const elegirPregunta = (nivel: number) => {
    const delNivel = banco.filter((p) => p.nivel === nivel);
    const disponibles = delNivel.filter((p) => !usadasRef.current.has(p.id));
    const candidatas = disponibles.length > 0 ? disponibles : delNivel;
    const elegida = candidatas[Math.floor(Math.random() * candidatas.length)];
    if (elegida) usadasRef.current.add(elegida.id);
    return elegida;
  };

  const cargarPreguntaNivel = () => {
    const primera = elegirPregunta(estado.nivel);
    if (primera) {
      reproducir("tic");
      emitir({
        type: "AVANZAR_PREGUNTA",
        preguntaId: primera.id,
        nivel: estado.nivel,
      });
    }
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
    const siguientePregunta = elegirPregunta(siguienteNivel);
    if (siguientePregunta) {
      reproducir("nivel");
      emitir({
        type: "SIGUIENTE_NIVEL",
        preguntaId: siguientePregunta.id,
        nivel: siguienteNivel,
      });
    }
  };

  const reiniciarPartida = () => setModalConfirmar("reiniciar");

  const liberarConcursante = () => setModalConfirmar("liberar");

  const confirmarAccion = () => {
    reproducir("confirmar");
    if (modalConfirmar === "reiniciar") emitir({ type: "REINICIAR_JUEGO" });
    if (modalConfirmar === "liberar") emitir({ type: "LIBERAR_PARTICIPANTE" });
    setModalConfirmar(null);
  };

  const cerrarSesion = async () => {
    await supabase?.auth.signOut();
    navigate("/", { replace: true });
  };

  const estadoConcursante =
    estado.participanteId === null
      ? { texto: "Esperando concursante", clase: "text-gray-300 border-gray-500" }
      : participanteConectado
        ? { texto: "Concursante conectado", clase: "text-emerald-300 border-emerald-500" }
        : { texto: "Concursante desconectado", clase: "text-rose-300 border-rose-500" };

  /* El concursante falló: aviso para liberar el puesto y seguir con el show. */
  const falloConcursante =
    estado.respuestaRevelada && estado.resultado === "incorrecto" && estado.fase === "fin";
  const zonaSegura = falloConcursante ? zonaSeguraAlcanzada(estado.nivel) : null;

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

      {/* MODAL DE CONFIRMACIÓN SILENCIOSA (sin diálogos del navegador) */}
      {modalConfirmar && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setModalConfirmar(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-md w-full p-6 rounded-2xl border-2 border-amber-400 bg-gradient-to-b from-[#12194b] to-[#04071f] text-center shadow-[0_0_35px_rgba(255,180,0,0.6)]"
          >
            <RotateCcw className="mx-auto text-amber-400 mb-3" size={44} />
            <h3 className="text-xl font-black uppercase text-amber-300 mb-2">
              {modalConfirmar === "reiniciar" ? "¿Reiniciar la partida?" : "¿Liberar al concursante?"}
            </h3>
            <p className="text-gray-200 text-sm mb-5">
              {modalConfirmar === "reiniciar"
                ? "El juego volverá al Nivel 1 y se generará un código nuevo de partida."
                : "El puesto quedará libre y se generará un código nuevo para que entre otra persona."}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setModalConfirmar(null)}
                className="px-4 py-2 rounded-lg border border-gray-500 bg-gray-800 text-white font-bold text-xs hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAccion}
                className="px-4 py-2 rounded-lg border-2 border-amber-400 bg-amber-600 text-white font-black text-xs hover:bg-amber-500"
              >
                Sí, {modalConfirmar === "reiniciar" ? "reiniciar" : "liberar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER COMPACTO DEL ADMINISTRADOR CON EL ESTILO DEL SHOW */}
      <header className="relative z-10 flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-gradient-to-r from-[#0a103c]/90 via-[#070b28]/95 to-[#0a103c]/90 backdrop-blur-md rounded-2xl border-2 border-amber-500/60 shadow-[0_4px_25px_rgba(255,180,0,0.2)] fade-in">
        {/* LADO IZQUIERDO: CÓDIGO DE PARTIDA */}
        <div className="flex items-center gap-2 md:gap-3">
          <div
            className="flex items-center gap-2 px-3 py-1 rounded-xl bg-blue-950/90 border border-amber-500/60"
            title="El concursante debe ingresar este código para unirse. Vale una sola vez."
          >
            <KeyRound size={14} className="text-amber-300 shrink-0" />
            <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest text-cyan-300">
              Código:
            </span>
            <span
              className={`font-mono font-black text-base tracking-[0.25em] ${
                codigoPartida ? "text-amber-300" : "text-gray-500 line-through"
              }`}
            >
              {codigoPartida ?? "USADO"}
            </span>
            <button
              onClick={generarCodigo}
              className="p-1 rounded-md text-cyan-300 hover:text-white hover:bg-cyan-500/20 border border-cyan-400/30 transition-all cursor-pointer"
              title="Generar un código nuevo"
            >
              <RefreshCw size={12} />
            </button>
          </div>
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

        {/* LADO DERECHO: ESTADO DEL CONCURSANTE, VER ETAPAS Y SESIÓN */}
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={() => setMostrarModalEscalera(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-cyan-200 bg-blue-900/80 hover:bg-blue-800 border border-cyan-400/40 rounded-xl transition-all cursor-pointer"
          >
            <BarChart3 size={15} /> Ver Etapas
          </button>
          <span
            className={`px-2.5 py-1 text-[11px] font-bold rounded-xl border bg-blue-950/80 ${estadoConcursante.clase}`}
          >
            ● {estadoConcursante.texto}
          </span>
          <button
            onClick={cerrarSesion}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-cyan-200 bg-blue-950 hover:bg-blue-900 border border-blue-700 rounded-xl transition-all cursor-pointer"
            title="Cerrar sesión"
          >
            <LogOut size={14} /> Salir
          </button>
        </div>
      </header>

      {/* TARJETA PRINCIPAL DEL PRESENTADOR ESTILO TV */}
      <main className="relative z-10 flex flex-col items-center justify-center flex-1 w-full max-w-6xl mx-auto my-3 md:my-5 py-4 fade-in">
        {falloConcursante && (
          <div className="w-full max-w-3xl flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 rounded-2xl border-2 border-rose-500 bg-rose-950/90 text-center shadow-[0_0_30px_rgba(248,113,113,0.5)] mb-2">
            <div className="flex items-center gap-3">
              <ShieldAlert className="text-rose-300 shrink-0" size={34} />
              <div className="text-left">
                <h3 className="text-sm font-black uppercase text-rose-200 tracking-wider">
                  El concursante falló en el Nivel {estado.nivel}
                </h3>
                <p className="text-xs text-rose-100/80">
                  Se va con su zona segura: {""}
                  <strong className="text-amber-300 font-black">
                    {zonaSegura ? `${zonaSegura.premio} (Nivel ${zonaSegura.nivel})` : "0 PTS"}
                  </strong>
                </p>
              </div>
            </div>
            <button
              onClick={liberarConcursante}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,180,0,0.7)] hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <UserX size={14} /> Sacar participante
            </button>
          </div>
        )}
        {preguntaActual ? (
          <div
            key={estado.preguntaActualId ?? "vacia"}
            className="flex flex-col items-center w-full gap-4 fade-in-cascada"
          >
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 w-full">
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
                    className={`relative flex items-center px-6 md:px-8 py-3.5 md:py-4 hex-lozenge border-2 transition-all ${estiloBordeFondo} ${
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

                    <span className="flex-1 text-left text-base md:text-lg font-bold drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
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
                {estado.comodinesUsados.llamadaAmigo && (
                  <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-600">Llamada</span>
                )}
                {estado.comodinesUsados.consultaProfesor && (
                  <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-600">Profesor</span>
                )}
                {!estado.comodinesUsados.cincuentaCincuenta && !estado.comodinesUsados.preguntaAudiencia && !estado.comodinesUsados.consultaProfesor && !estado.comodinesUsados.llamadaAmigo && (
                  <span className="text-gray-400 italic">Ninguno</span>
                )}
              </div>
            </div>

            {/* BOTONES DE CONTROL SECUENCIALES DEL PRESENTADOR */}
            <div className="flex flex-wrap items-center justify-center gap-4 w-full pt-2">
              <button
                type="button"
                disabled={!estado.respuestaConfirmada || estado.respuestaRevelada}
                onClick={revelarRespuesta}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-black disabled:opacity-40 font-black text-xs md:text-sm uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,180,0,0.7)] cursor-pointer hover:scale-105 active:scale-95"
              >
                <Eye size={16} /> 1. Revelar Respuesta
              </button>

              {estado.nivel < 15 && (
                <button
                  type="button"
                  disabled={!estado.respuestaRevelada || estado.resultado !== "correcto"}
                  onClick={avanzarSiguienteNivel}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 font-black text-xs md:text-sm uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(16,185,129,0.6)] cursor-pointer hover:scale-105 active:scale-95"
                >
                  <ChevronRight size={16} /> 2. Siguiente Pregunta
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
      <footer className="relative z-10 flex justify-center gap-3 py-1">
        <button
          onClick={reiniciarPartida}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-red-500/40 bg-red-950/20 hover:bg-red-900/40 text-red-300 text-[11px] font-bold transition-all cursor-pointer"
        >
          <RotateCcw size={12} /> Reiniciar Partida
        </button>
        <button
          onClick={liberarConcursante}
          disabled={estado.participanteId === null}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-amber-500/40 bg-amber-950/20 hover:bg-amber-900/40 disabled:opacity-40 text-amber-300 text-[11px] font-bold transition-all cursor-pointer"
        >
          <UserX size={12} /> Liberar Concursante
        </button>
      </footer>
    </div>
  );
};
