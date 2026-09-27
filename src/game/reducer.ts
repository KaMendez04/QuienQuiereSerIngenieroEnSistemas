import type { EstadoJuego, Pregunta, Resultado, SugerenciaAmigo } from "./tipos";

export type Accion =
  | { type: "AVANZAR_PREGUNTA"; preguntaId: string; nivel: number }
  | { type: "INICIAR_TIEMPO" }
  | { type: "USAR_COMODIN_50_50"; opcionesEliminadas: number[] }
  | { type: "USAR_COMODIN_CONSULTA" }
  | { type: "USAR_COMODIN_AUDIENCIA"; distribucion: number[] }
  | { type: "USAR_COMODIN_LLAMADA"; sugerencia: SugerenciaAmigo }
  | { type: "SELECCIONAR_OPCION"; index: number }
  | { type: "CONFIRMAR_RESPUESTA" }
  | { type: "REVELAR_RESPUESTA"; correctaIndex: number }
  | { type: "SIGUIENTE_NIVEL"; preguntaId: string; nivel: number }
  | { type: "PLANTARSE" }
  | { type: "REINICIAR_JUEGO" }
  | { type: "ASIGNAR_PARTICIPANTE"; participanteId: string }
  | { type: "LIBERAR_PARTICIPANTE" }
  | { type: "SINCRONIZAR_ESTADO"; estado: EstadoJuego };

export const estadoInicial: EstadoJuego = {
  preguntaActualId: null,
  nivel: 1,
  comodinesUsados: {
    cincuentaCincuenta: false,
    consultaProfesor: false,
    preguntaAudiencia: false,
    llamadaAmigo: false,
  },
  opcionesEliminadas: [],
  opcionSeleccionada: null,
  respuestaConfirmada: false,
  tiempoCorriendo: false,
  respuestaRevelada: false,
  resultado: null,
  distribucionAudiencia: null,
  sugerenciaAmigo: null,
  retirado: false,
  fase: "esperando",
  participanteId: null,
};

/** Hay una pregunta en juego y el concursante todavía puede interactuar. */
function enJuego(estado: EstadoJuego): boolean {
  return (
    estado.preguntaActualId !== null &&
    estado.fase === "jugando" &&
    !estado.retirado &&
    !estado.respuestaRevelada
  );
}

export function opcionesIncorrectas(pregunta: Pregunta): number[] {
  const indices = pregunta.opciones
    .map((_, i) => i)
    .filter((i) => i !== pregunta.correctaIndex);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices.slice(0, 2);
}

export function generarDistribucionAudiencia(correctaIndex: number): number[] {
  const pesos = [0, 1, 2, 3].map((i) =>
    i === correctaIndex ? 55 + Math.random() * 25 : 5 + Math.random() * 15,
  );
  const total = pesos.reduce((a, b) => a + b, 0);
  return pesos.map((p) => Math.round((p / total) * 100));
}

/**
 * Consejo del amigo para el comodín de la llamada: en general acierta
 * (~75% de las veces), pero a veces se equivoca como cualquier humano.
 */
export function generarSugerenciaAmigo(correctaIndex: number): SugerenciaAmigo {
  const acierta = Math.random() < 0.75;
  const index = acierta
    ? correctaIndex
    : ([0, 1, 2, 3] as const)
        .filter((i) => i !== correctaIndex)
        [Math.floor(Math.random() * 3)];
  return {
    index,
    confianza: 50 + Math.floor(Math.random() * 40), // 50-89 %
  };
}

export function reducer(estado: EstadoJuego, accion: Accion): EstadoJuego {
  switch (accion.type) {
    case "SINCRONIZAR_ESTADO":
      return accion.estado;

    case "AVANZAR_PREGUNTA":
      return {
        ...estadoInicial,
        comodinesUsados: estado.comodinesUsados,
        participanteId: estado.participanteId,
        nivel: accion.nivel,
        preguntaActualId: accion.preguntaId,
        fase: "jugando",
      };

    case "SIGUIENTE_NIVEL":
      return {
        ...estadoInicial,
        comodinesUsados: estado.comodinesUsados,
        participanteId: estado.participanteId,
        nivel: accion.nivel,
        preguntaActualId: accion.preguntaId,
        fase: "jugando",
      };

    case "INICIAR_TIEMPO":
      if (estado.preguntaActualId === null) return estado;
      return { ...estado, tiempoCorriendo: true };

    case "USAR_COMODIN_50_50": {
      if (
        estado.comodinesUsados.cincuentaCincuenta ||
        estado.respuestaConfirmada ||
        !enJuego(estado)
      )
        return estado;
      return {
        ...estado,
        comodinesUsados: {
          ...estado.comodinesUsados,
          cincuentaCincuenta: true,
        },
        opcionesEliminadas: accion.opcionesEliminadas,
      };
    }

    case "USAR_COMODIN_CONSULTA":
      if (estado.comodinesUsados.consultaProfesor) return estado;
      return {
        ...estado,
        comodinesUsados: { ...estado.comodinesUsados, consultaProfesor: true },
      };

    case "USAR_COMODIN_AUDIENCIA": {
      if (
        estado.comodinesUsados.preguntaAudiencia ||
        estado.respuestaConfirmada ||
        !enJuego(estado)
      )
        return estado;
      return {
        ...estado,
        comodinesUsados: { ...estado.comodinesUsados, preguntaAudiencia: true },
        distribucionAudiencia: accion.distribucion,
      };
    }

    case "USAR_COMODIN_LLAMADA": {
      if (
        estado.comodinesUsados.llamadaAmigo ||
        estado.respuestaConfirmada ||
        !enJuego(estado)
      )
        return estado;
      return {
        ...estado,
        comodinesUsados: {
          ...estado.comodinesUsados,
          llamadaAmigo: true,
        },
        sugerenciaAmigo: accion.sugerencia,
      };
    }

    case "SELECCIONAR_OPCION":
      if (
        !enJuego(estado) ||
        !Number.isInteger(accion.index) ||
        estado.respuestaConfirmada ||
        estado.opcionesEliminadas.includes(accion.index) ||
        accion.index < 0 ||
        accion.index > 3
      )
        return estado;
      return { ...estado, opcionSeleccionada: accion.index };

    case "CONFIRMAR_RESPUESTA":
      if (
        !enJuego(estado) ||
        estado.opcionSeleccionada === null ||
        estado.respuestaConfirmada
      )
        return estado;
      return { ...estado, respuestaConfirmada: true, tiempoCorriendo: false };

    case "REVELAR_RESPUESTA": {
      if (!estado.respuestaConfirmada || estado.respuestaRevelada)
        return estado;
      const resultado: Resultado =
        estado.opcionSeleccionada === accion.correctaIndex
          ? "correcto"
          : "incorrecto";
      return {
        ...estado,
        respuestaRevelada: true,
        resultado,
        tiempoCorriendo: false,
        fase: resultado === "incorrecto" ? "fin" : estado.fase,
      };
    }

    case "PLANTARSE":
      if (!enJuego(estado) || estado.respuestaConfirmada) return estado;
      return {
        ...estado,
        retirado: true,
        fase: "fin",
        tiempoCorriendo: false,
      };

    case "REINICIAR_JUEGO":
      return { ...estadoInicial, participanteId: estado.participanteId };

    case "ASIGNAR_PARTICIPANTE":
      if (estado.participanteId !== null) return estado;
      return { ...estado, participanteId: accion.participanteId };

    case "LIBERAR_PARTICIPANTE":
      return { ...estadoInicial };

    default:
      return estado;
  }
}
