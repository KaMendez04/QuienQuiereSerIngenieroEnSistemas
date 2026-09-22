import type { EstadoJuego, Pregunta, Resultado } from "./tipos";

export type Accion =
  | { type: "AVANZAR_PREGUNTA"; preguntaId: string; nivel: number }
  | { type: "INICIAR_TIEMPO" }
  | { type: "USAR_COMODIN_50_50"; opcionesEliminadas: number[] }
  | { type: "USAR_COMODIN_CONSULTA" }
  | { type: "USAR_COMODIN_AUDIENCIA"; distribucion: number[] }
  | { type: "SELECCIONAR_OPCION"; index: number }
  | { type: "CONFIRMAR_RESPUESTA" }
  | { type: "REVELAR_RESPUESTA"; correctaIndex: number }
  | { type: "SIGUIENTE_NIVEL"; preguntaId: string; nivel: number }
  | { type: "PLANTARSE" }
  | { type: "REINICIAR_JUEGO" }
  | { type: "SINCRONIZAR_ESTADO"; estado: EstadoJuego };

export const estadoInicial: EstadoJuego = {
  preguntaActualId: null,
  nivel: 1,
  comodinesUsados: {
    cincuentaCincuenta: false,
    consultaProfesor: false,
    preguntaAudiencia: false,
  },
  opcionesEliminadas: [],
  opcionSeleccionada: null,
  respuestaConfirmada: false,
  tiempoCorriendo: false,
  respuestaRevelada: false,
  resultado: null,
  distribucionAudiencia: null,
  retirado: false,
  fase: "esperando",
};

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

export function reducer(estado: EstadoJuego, accion: Accion): EstadoJuego {
  switch (accion.type) {
    case "SINCRONIZAR_ESTADO":
      return accion.estado;

    case "AVANZAR_PREGUNTA":
      return {
        ...estadoInicial,
        comodinesUsados: estado.comodinesUsados,
        nivel: accion.nivel,
        preguntaActualId: accion.preguntaId,
        fase: "jugando",
      };

    case "SIGUIENTE_NIVEL":
      return {
        ...estadoInicial,
        comodinesUsados: estado.comodinesUsados,
        nivel: accion.nivel,
        preguntaActualId: accion.preguntaId,
        fase: "jugando",
      };

    case "INICIAR_TIEMPO":
      if (estado.preguntaActualId === null) return estado;
      return { ...estado, tiempoCorriendo: true };

    case "USAR_COMODIN_50_50": {
      if (estado.comodinesUsados.cincuentaCincuenta) return estado;
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
      if (estado.comodinesUsados.preguntaAudiencia) return estado;
      return {
        ...estado,
        comodinesUsados: { ...estado.comodinesUsados, preguntaAudiencia: true },
        distribucionAudiencia: accion.distribucion,
      };
    }

    case "SELECCIONAR_OPCION":
      if (
        estado.respuestaConfirmada ||
        estado.opcionesEliminadas.includes(accion.index) ||
        accion.index < 0 ||
        accion.index > 3
      )
        return estado;
      return { ...estado, opcionSeleccionada: accion.index };

    case "CONFIRMAR_RESPUESTA":
      if (estado.opcionSeleccionada === null || estado.respuestaConfirmada)
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
      return {
        ...estado,
        retirado: true,
        fase: "fin",
        tiempoCorriendo: false,
      };

    case "REINICIAR_JUEGO":
      return { ...estadoInicial };

    default:
      return estado;
  }
}
