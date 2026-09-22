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
  retirado: boolean;
  fase: "esperando" | "jugando" | "fin";
}

export const LETRAS = ["A", "B", "C", "D"] as const;
