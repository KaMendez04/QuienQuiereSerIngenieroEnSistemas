export type Categoria = "carrera" | "logica";

export interface Pregunta {
  id: string;
  nivel: number;
  categoria: Categoria;
  texto: string;
  opciones: [string, string, string, string];
  correctaIndex: 0 | 1 | 2 | 3;
}

export interface ComodinesUsados {
  cincuentaCincuenta: boolean;
  consultaProfesor: boolean;
  preguntaAudiencia: boolean;
  llamadaAmigo: boolean;
}

/** Consejo que da el amigo del concursante al usar el comodín de la llamada. */
export interface SugerenciaAmigo {
  /** Índice de la opción que el amigo cree correcta (0-3). */
  index: number;
  /** Confianza declarada por el amigo, de 1 a 100. */
  confianza: number;
}

export type Resultado = "correcto" | "incorrecto";

export interface EstadoJuego {
  preguntaActualId: string | null;
  nivel: number;
  comodinesUsados: ComodinesUsados;
  opcionesEliminadas: number[];
  opcionSeleccionada: number | null;
  respuestaConfirmada: boolean;
  tiempoCorriendo: boolean;
  respuestaRevelada: boolean;
  resultado: Resultado | null;
  distribucionAudiencia: number[] | null;
  sugerenciaAmigo: SugerenciaAmigo | null;
  retirado: boolean;
  fase: "esperando" | "jugando" | "fin";
  /** Huella pública (hash) del token del concursante que tiene el turno. */
  participanteId: string | null;
}

export const LETRAS = ["A", "B", "C", "D"] as const;
