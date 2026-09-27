import React, { useState, useEffect } from "react";
import { useJuegoParticipante } from "../hooks/useSincronizacion";
import type { EstadoJuego, Pregunta } from "../game/tipos";
import type { Solicitud } from "../game/validacion";
import { useSonidos } from "../hooks/useSonidos";
import { LogoMillonario } from "../components/LogoMillonario";
import { ComodinOvalo } from "../components/ComodinOvalo";
import { ModalEscalera } from "../components/ModalEscalera";
import { CajaPreguntaTv } from "../components/CajaPreguntaTv";
import { BotonRespuestaTv } from "../components/BotonRespuestaTv";
import { ModalAudiencia } from "../components/ModalAudiencia";
import { ModalLlamada } from "../components/ModalLlamada";
import { ESCALERA, zonaSeguraAlcanzada } from "../game/escalera";
import { CODIGO_PARTIDA } from "../game/validacion";
import { Trophy, ShieldAlert, Award, BarChart3, Lock, Loader2, KeyRound, AlertTriangle, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";

const CLAVE_CODIGO_PARTIDA = "millonario_codigo_partida";

const PantallaMensaje: React.FC<{
  icono: React.ReactNode;
  titulo: string;
  texto: string;
  pie?: React.ReactNode;
}> = ({ icono, titulo, texto, pie }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-studio text-white p-4">
    <div className="flex flex-col items-center max-w-md w-full p-8 rounded-3xl border-2 border-blue-700 bg-blue-950/70 text-center shadow-[0_0_30px_rgba(0,50,180,0.5)]">
      <LogoMillonario size={110} textoPrincipal="INGENIERO" className="mb-3" />
      {icono}
      <h2 className="text-2xl font-black uppercase tracking-wider mb-2">{titulo}</h2>
      <p className="text-cyan-200/80 text-sm mb-6">{texto}</p>
      {pie ?? (
        <Link to="/" className="text-xs text-cyan-200/80 hover:text-cyan-100 underline">
          Volver al inicio
        </Link>
      )}
    </div>
  </div>
);

/* Formulario para ingresar el código de partida de un solo uso. */
const PantallaCodigo: React.FC<{ onAceptar: (codigo: string) => void }> = ({
  onAceptar,
}) => {
  const [valor, setValor] = useState("");
  const [error, setError] = useState<string | null>(null);

  const enviar = (ev: React.FormEvent) => {
    ev.preventDefault();
    const limpio = valor.trim().toUpperCase();
    if (!CODIGO_PARTIDA.test(limpio)) {
      setError("El código tiene 6 letras y/o números (sin I, O, 0, 1).");
      return;
    }
    onAceptar(limpio);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-studio text-white p-4">
      <form
        onSubmit={enviar}
        className="flex flex-col items-center max-w-md w-full p-8 rounded-3xl border-2 border-cyan-500/60 bg-gradient-to-b from-[#0e174a] via-[#080d33] to-[#03051c] shadow-[0_0_40px_rgba(0,100,255,0.4)] text-center"
      >
        <LogoMillonario size={110} textoPrincipal="INGENIERO" className="mb-3" />
        <h1 className="flex items-center gap-2 text-xl font-black uppercase tracking-wider text-cyan-200 mb-2">
          <KeyRound size={20} /> Código de la Partida
        </h1>
        <p className="text-cyan-200/70 text-xs mb-6">
          Pide al presentador el código de esta partida para ocupar el puesto de
          concursante. Cada código vale para una sola persona.
        </p>
        <input
          type="text"
          inputMode="text"
          autoComplete="off"
          autoFocus
          placeholder="ABC123"
          maxLength={6}
          value={valor}
          onChange={(e) => {
            setValor(e.target.value.toUpperCase());
            setError(null);
          }}
          className="w-full mb-2 px-4 py-3 rounded-xl text-center font-mono font-black text-2xl tracking-[0.35em] uppercase bg-blue-950/80 border-2 border-blue-600 focus:outline-none focus:border-amber-400 text-amber-300 placeholder:text-blue-700"
        />
        {error && (
          <p role="alert" className="w-full mb-2 text-xs font-bold text-rose-300">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={!CODIGO_PARTIDA.test(valor.trim().toUpperCase())}
          className="w-full mt-3 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-black text-sm uppercase tracking-wider disabled:opacity-40 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
        >
          Entrar a la Partida
        </button>
        <Link
          to="/"
          className="mt-5 text-xs text-cyan-200/80 hover:text-cyan-100 underline"
        >
          Volver al inicio
        </Link>
      </form>
    </div>
  );
};

export const VistaParticipante: React.FC = () => {
  /* El código se recuerda en esta pestaña para sobrevivir recargas.
   * Al liberar/reiniciar la partida el presentador emite uno nuevo y este
   * quedará invalidado de todas formas. */
  const [codigo, setCodigo] = useState<string | null>(() => {
    try {
      const guardado = sessionStorage.getItem(CLAVE_CODIGO_PARTIDA);
      return guardado && CODIGO_PARTIDA.test(guardado) ? guardado : null;
    } catch {
      return null;
    }
  });
  const { estado, adminConectado, soyParticipante, preguntaActual, enviar, codigoRechazado } =
    useJuegoParticipante(codigo);

  const aceptarCodigo = (nuevo: string) => {
    try {
      sessionStorage.setItem(CLAVE_CODIGO_PARTIDA, nuevo);
    } catch {
      // Sin persistencia: el código vive solo en el estado de la vista.
    }
    setCodigo(nuevo);
  };

  const limpiarCodigo = () => {
    try {
      sessionStorage.removeItem(CLAVE_CODIGO_PARTIDA);
    } catch {
      // Ignorado.
    }
    setCodigo(null);
  };

  /* Pantalla para ingresar el código de partida que muestra el presentador. */
  if (!codigo) {
    return <PantallaCodigo onAceptar={aceptarCodigo} />;
  }

  /* El código fue rechazado (incorrecto, ya usado o expirado): pedir uno nuevo. */
  if (codigoRechazado && !soyParticipante) {
    return (
      <PantallaMensaje
        icono={<AlertTriangle className="text-rose-400 mb-3" size={44} />}
        titulo="Código no válido"
        texto="El código no es correcto o ya fue utilizado por otro concursante. Pide al presentador un código nuevo."
        pie={
          <button
            onClick={() => limpiarCodigo()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-cyan-400/50 bg-blue-900/70 hover:bg-blue-800 text-cyan-200 text-xs font-bold transition-all cursor-pointer"
          >
            <RotateCcw size={14} /> Intentar con otro código
          </button>
        }
      />
    );
  }

  if (!estado || !adminConectado) {
    return (
      <PantallaMensaje
        icono={<Loader2 className="text-amber-400 mb-3 animate-spin" size={44} />}
        titulo="Esperando al presentador"
        texto="La partida comenzará cuando el administrador abra la consola del juego."
      />
    );
  }

  if (estado.participanteId !== null && !soyParticipante) {
    return (
      <PantallaMensaje
        icono={<Lock className="text-rose-400 mb-3" size={44} />}
        titulo="La partida ya empezó"
        texto="Ya hay un concursante jugando con el presentador. Solo se permite un concursante a la vez; espera a que termine la partida."
      />
    );
  }

  if (!soyParticipante) {
    return (
      <PantallaMensaje
        icono={<Loader2 className="text-amber-400 mb-3 animate-spin" size={44} />}
        titulo="Uniéndote a la partida"
        texto="Reservando tu lugar como concursante..."
      />
    );
  }

  return (
    <PantallaConcursante
      estado={estado}
      preguntaActual={preguntaActual}
      enviar={enviar}
    />
  );
};

const PantallaConcursante: React.FC<{
  estado: EstadoJuego;
  preguntaActual: Pregunta | null;
  enviar: (s: Solicitud) => void;
}> = ({ estado, preguntaActual, enviar }) => {
  const reproducir = useSonidos();
  const [mostrarModalAudiencia, setMostrarModalAudiencia] = useState(false);
  const [mostrarModalLlamada, setMostrarModalLlamada] = useState(false);
  const [mostrarModalEscalera, setMostrarModalEscalera] = useState(false);
  const [confirmandoRetiro, setConfirmandoRetiro] = useState(false);

  // Efectos de sonido
  useEffect(() => {
    if (estado.tiempoCorriendo && !estado.respuestaConfirmada) {
      reproducir("tic");
    }
  }, [estado.tiempoCorriendo, estado.respuestaConfirmada, reproducir]);

  useEffect(() => {
    if (estado.respuestaRevelada && estado.resultado) {
      reproducir(estado.resultado === "correcto" ? "acierto" : "error");
    }
  }, [estado.respuestaRevelada, estado.resultado, reproducir]);

  // Modal de audiencia
  useEffect(() => {
    if (estado.distribucionAudiencia) {
      setMostrarModalAudiencia(true);
    }
  }, [estado.distribucionAudiencia]);

  // Modal de la llamada al amigo (se abre solo la primera vez que llega el consejo)
  useEffect(() => {
    if (estado.sugerenciaAmigo) {
      setMostrarModalLlamada(true);
    }
  }, [estado.sugerenciaAmigo]);

  // Manejadores de comodines
  const manejar5050 = () => {
    if (!preguntaActual || estado.comodinesUsados.cincuentaCincuenta || estado.respuestaConfirmada) return;
    reproducir("confirmar");
    enviar({ tipo: "USAR_COMODIN_50_50" });
  };

  const manejarAudiencia = () => {
    if (!preguntaActual || estado.comodinesUsados.preguntaAudiencia || estado.respuestaConfirmada) return;
    reproducir("confirmar");
    enviar({ tipo: "USAR_COMODIN_AUDIENCIA" });
  };

  /* Disponible solo después de la primera zona segura (Nivel 5, Seguro 1). */
  const llamadaDisponible = estado.nivel > 5;
  const manejarLlamada = () => {
    if (!preguntaActual || estado.comodinesUsados.llamadaAmigo || estado.respuestaConfirmada || !llamadaDisponible) return;
    reproducir("confirmar");
    enviar({ tipo: "USAR_COMODIN_LLAMADA" });
  };

  const manejarRetirada = () => {
    setConfirmandoRetiro(true);
  };

  const confirmarRetirada = () => {
    setConfirmandoRetiro(false);
    enviar({ tipo: "PLANTARSE" });
  };

  // Selección y confirmación de respuesta
  const seleccionarOpcion = (indice: number) => {
    if (estado.respuestaConfirmada || estado.respuestaRevelada || estado.opcionesEliminadas.includes(indice)) return;
    reproducir("confirmar");
    enviar({ tipo: "SELECCIONAR_OPCION", index: indice });
  };

  const confirmarRespuesta = () => {
    if (estado.opcionSeleccionada === null || estado.respuestaConfirmada) return;
    reproducir("confirmar");
    enviar({ tipo: "CONFIRMAR_RESPUESTA" });
  };

  const nivelActualInfo = ESCALERA.find((e) => e.nivel === estado.nivel);
  const fallo = estado.respuestaRevelada && estado.resultado === "incorrecto";
  const zonaSegura = fallo ? zonaSeguraAlcanzada(estado.nivel) : null;

  return (
    <div className="relative flex flex-col justify-between min-h-screen w-full bg-studio overflow-hidden p-2 md:p-4 text-white">
      {/* MENSAJE DE DESPEDIDA AL FALLAR (pantalla completa, silenciosa) */}
      {fallo && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-studio text-white p-4">
          <div className="flex flex-col items-center max-w-md w-full p-8 rounded-3xl border-2 border-rose-500 bg-rose-950/70 text-center shadow-[0_0_40px_rgba(190,20,20,0.6)]">
            <Award className="text-amber-400 mb-3 drop-shadow-[0_0_20px_rgba(255,180,0,0.8)]" size={56} />
            <h2 className="text-3xl font-black uppercase text-white tracking-wider mb-2">
              ¡Gracias por participar!
            </h2>
            <p className="text-rose-200/90 text-sm mb-5">
              Respondiste incorrectamente la pregunta del Nivel {estado.nivel}.
            </p>
            <div className="w-full p-4 rounded-2xl border-2 border-amber-400 bg-blue-950/80 mb-5">
              <span className="block text-[10px] font-black uppercase tracking-widest text-cyan-300 mb-1">
                Tu última zona segura
              </span>
              <strong className="block text-2xl font-black text-amber-300">
                {zonaSegura ? zonaSegura.premio : "0 PTS"}
              </strong>
              <span className="block text-xs text-gray-200 mt-1">
                {zonaSegura
                  ? `Nivel ${zonaSegura.nivel} — ${zonaSegura.titulo}`
                  : "No alcanzaste ninguna zona segura"}
              </span>
            </div>
            <Link to="/" className="text-xs text-cyan-200/80 hover:text-cyan-100 underline">
              Volver al inicio
            </Link>
          </div>
        </div>
      )}

      {/* Rayo de luz horizontal central del estudio */}
      <div className="absolute top-1/2 left-0 right-0 h-1 horizontal-beam pointer-events-none z-0" />

      {/* MODAL AUDIENCIA */}
      {mostrarModalAudiencia && (
        <ModalAudiencia
          distribucion={estado.distribucionAudiencia}
          onCerrar={() => setMostrarModalAudiencia(false)}
        />
      )}

      {/* MODAL LLAMADA */}
      {mostrarModalLlamada && (
        <ModalLlamada
          sugerencia={estado.sugerenciaAmigo}
          onCerrar={() => setMostrarModalLlamada(false)}
        />
      )}

      {/* MODAL ESCALERA DE ETAPAS Y PREMIOS */}
      <ModalEscalera
        abierto={mostrarModalEscalera}
        nivelActual={estado.nivel}
        onCerrar={() => setMostrarModalEscalera(false)}
      />

      {/* MODAL CONFIRMAR RETIRO */}
      {confirmandoRetiro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="max-w-md w-full p-6 rounded-2xl border-2 border-amber-400 bg-gradient-to-b from-[#12194b] to-[#04071f] text-center shadow-[0_0_35px_rgba(255,180,0,0.6)]">
            <ShieldAlert className="mx-auto text-amber-400 mb-3" size={44} />
            <h3 className="text-xl font-black uppercase text-amber-300 mb-2">
              ¿Deseas plantarte?
            </h3>
            <p className="text-gray-200 text-sm mb-5">
              Te retirarás con el premio acumulado:{" "}
              <strong className="text-amber-300 font-black">
                {nivelActualInfo ? nivelActualInfo.premio : "0 PTS"}
              </strong>
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setConfirmandoRetiro(false)}
                className="px-4 py-2 rounded-lg border border-gray-500 bg-gray-800 text-white font-bold text-xs hover:bg-gray-700"
              >
                Seguir jugando
              </button>
              <button
                onClick={confirmarRetirada}
                className="px-4 py-2 rounded-lg border-2 border-amber-400 bg-amber-600 text-white font-black text-xs hover:bg-amber-500"
              >
                Sí, me retiro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER COMPACTO Y DISTRIBUIDO A LO ANCHO */}
      <header className="relative z-10 flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-gradient-to-r from-[#0a103c]/90 via-[#070b28]/95 to-[#0a103c]/90 backdrop-blur-md rounded-2xl border-2 border-blue-600/50 shadow-[0_4px_20px_rgba(0,0,0,0.7)] fade-in">
        {/* LADO IZQUIERDO: COMODINES EN FILA HORIZONTAL */}
        <div className="flex items-center gap-2 md:gap-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300 hidden sm:inline mr-1">
            Comodines:
          </span>
          <ComodinOvalo
            tipo="50:50"
            usado={estado.comodinesUsados.cincuentaCincuenta}
            onClick={manejar5050}
            titulo="Comodín 50:50"
          />
          <ComodinOvalo
            tipo="audiencia"
            usado={estado.comodinesUsados.preguntaAudiencia}
            onClick={manejarAudiencia}
            titulo="Comodín del Público"
          />
          <ComodinOvalo
            tipo="llamada"
            usado={estado.comodinesUsados.llamadaAmigo}
            deshabilitado={!llamadaDisponible}
            onClick={manejarLlamada}
            titulo={
              llamadaDisponible
                ? "Comodín de la Llamada al Amigo"
                : "Se desbloquea al superar el Seguro 1 (Nivel 5)"
            }
          />
          <ComodinOvalo
            tipo="retirarse"
            onClick={manejarRetirada}
            titulo="Plantarse / Retirarse"
          />
        </div>

        {/* CENTRO: LOGO COMPACTO Y TÍTULO OFICIAL */}
        <div className="flex items-center gap-3 md:gap-4">
          <LogoMillonario size={64} textoPrincipal="INGENIERO" />
          <div className="text-center">
            <h1 className="text-sm md:text-lg font-black uppercase tracking-wider text-amber-300 drop-shadow-[0_0_8px_rgba(255,180,0,0.7)]">
              ¿Quién Quiere Ser Ingeniero en Sistemas?
            </h1>
            <span className="text-[11px] font-bold text-cyan-200">
              Nivel {estado.nivel} de 15 · <span className="text-amber-300 font-extrabold">{nivelActualInfo?.premio}</span> ({nivelActualInfo?.titulo})
            </span>
          </div>
        </div>

        {/* LADO DERECHO: BOTÓN VER ETAPAS (Sin enlaces a Admin) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMostrarModalEscalera(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-[0_0_15px_rgba(255,180,0,0.6)] transition-all cursor-pointer hover:scale-105 active:scale-95"
            title="Ver escalera de etapas y puntos"
          >
            <BarChart3 size={16} /> Ver Etapas
          </button>
        </div>
      </header>

      {/* SECCIÓN PRINCIPAL: PREGUNTA Y 4 OPCIONES A LO ANCHO */}
      <main className="relative z-10 flex flex-col items-center justify-center flex-1 w-full max-w-6xl mx-auto my-2 md:my-4 py-4 fade-in">
        {preguntaActual ? (
          <div
            key={estado.preguntaActualId ?? "vacia"}
            className="flex flex-col items-center w-full gap-3 md:gap-4 fade-in-cascada"
          >
            {/* CAJA DE PREGUNTA ALARGADA */}
            <CajaPreguntaTv
              texto={preguntaActual.texto}
              categoria={preguntaActual.categoria}
            />

            {/* OPCIONES 2x2 EXTENDIDAS A LO ANCHO */}
            <div className="relative w-full">
              {/* Punto de luz brillante en el centro */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full studio-flare pointer-events-none z-20" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-3">
                <BotonRespuestaTv
                  index={0}
                  texto={preguntaActual.opciones[0]}
                  eliminada={estado.opcionesEliminadas.includes(0)}
                  seleccionada={estado.opcionSeleccionada === 0}
                  revelada={estado.respuestaRevelada}
                  esCorrecta={preguntaActual.correctaIndex === 0}
                  resultado={estado.resultado}
                  porcentajeAudiencia={estado.distribucionAudiencia?.[0] ?? null}
                  onClick={() => seleccionarOpcion(0)}
                />
                <BotonRespuestaTv
                  index={1}
                  texto={preguntaActual.opciones[1]}
                  eliminada={estado.opcionesEliminadas.includes(1)}
                  seleccionada={estado.opcionSeleccionada === 1}
                  revelada={estado.respuestaRevelada}
                  esCorrecta={preguntaActual.correctaIndex === 1}
                  resultado={estado.resultado}
                  porcentajeAudiencia={estado.distribucionAudiencia?.[1] ?? null}
                  onClick={() => seleccionarOpcion(1)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <BotonRespuestaTv
                  index={2}
                  texto={preguntaActual.opciones[2]}
                  eliminada={estado.opcionesEliminadas.includes(2)}
                  seleccionada={estado.opcionSeleccionada === 2}
                  revelada={estado.respuestaRevelada}
                  esCorrecta={preguntaActual.correctaIndex === 2}
                  resultado={estado.resultado}
                  porcentajeAudiencia={estado.distribucionAudiencia?.[2] ?? null}
                  onClick={() => seleccionarOpcion(2)}
                />
                <BotonRespuestaTv
                  index={3}
                  texto={preguntaActual.opciones[3]}
                  eliminada={estado.opcionesEliminadas.includes(3)}
                  seleccionada={estado.opcionSeleccionada === 3}
                  revelada={estado.respuestaRevelada}
                  esCorrecta={preguntaActual.correctaIndex === 3}
                  resultado={estado.resultado}
                  porcentajeAudiencia={estado.distribucionAudiencia?.[3] ?? null}
                  onClick={() => seleccionarOpcion(3)}
                />
              </div>
            </div>

            {/* BOTÓN DE CONFIRMACIÓN / RETROALIMENTACIÓN */}
            <div className="flex flex-col items-center justify-center w-full py-1">
              {estado.opcionSeleccionada !== null && !estado.respuestaConfirmada && (
                <button
                  onClick={confirmarRespuesta}
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-black font-black text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(255,180,0,0.9)] hover:scale-105 active:scale-95 transition-all cursor-pointer animate-bounce"
                >
                  🔒 Confirmar Respuesta (Última palabra)
                </button>
              )}

              {estado.respuestaConfirmada && !estado.respuestaRevelada && (
                <div className="px-5 py-1.5 rounded-full bg-blue-950/90 border border-amber-400 text-amber-300 text-xs font-black shadow-[0_0_15px_rgba(255,180,0,0.4)]">
                  🔒 Respuesta bloqueada. El presentador revelará el resultado...
                </div>
              )}

              {estado.respuestaRevelada && (
                <div className={`px-6 py-2 rounded-full text-sm font-black uppercase tracking-wider ${
                  estado.resultado === "correcto"
                    ? "bg-emerald-950 text-emerald-300 border-2 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.6)]"
                    : "bg-rose-950 text-rose-300 border-2 border-rose-400 shadow-[0_0_20px_rgba(248,113,113,0.6)]"
                }`}>
                  {estado.resultado === "correcto" ? "✓ ¡Respuesta Correcta!" : "✕ ¡Respuesta Incorrecta!"}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-blue-700 bg-blue-950/60 text-center shadow-[0_0_30px_rgba(0,50,180,0.4)]">
            <Trophy className="text-amber-400 mb-3 drop-shadow-[0_0_20px_rgba(255,200,0,0.8)]" size={56} />
            <h2 className="text-2xl md:text-3xl font-black uppercase text-white tracking-wider mb-2">
              Esperando al presentador
            </h2>
            <p className="text-cyan-200/80 text-sm max-w-md">
              El administrador cargará la pregunta para dar inicio al concurso.
            </p>
          </div>
        )}

        {/* RETIRADA */}
        {estado.retirado && (
          <div className="w-full max-w-md p-4 rounded-2xl border-2 border-amber-400 bg-amber-950/90 text-center my-2 shadow-[0_0_25px_rgba(255,180,0,0.6)]">
            <Award className="mx-auto text-amber-400 mb-1" size={32} />
            <h3 className="text-lg font-black text-amber-300 uppercase">
              ¡Te has retirado del juego!
            </h3>
            <p className="text-white text-xs">
              Te llevas a casa el premio acumulado:{" "}
              <strong className="text-amber-300 font-black">
                {nivelActualInfo?.premio}
              </strong>
            </p>
          </div>
        )}
      </main>
    </div>
  );
};
