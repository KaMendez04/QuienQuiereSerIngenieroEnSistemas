import type { EstadoJuego, SugerenciaAmigo } from "./tipos";

function esSugerenciaAmigo(v: unknown): v is SugerenciaAmigo {
  return (
    esObjeto(v) &&
    esEnteroEntre(v.index, 0, 3) &&
    esEnteroEntre(v.confianza, 1, 100)
  );
}

/*
 * Todo lo que llega por la red (Supabase Realtime) o desde localStorage se trata
 * como datos no confiables: se valida la forma exacta y se reconstruye un objeto
 * limpio, descartando cualquier campo extra.
 */

const ID_PREGUNTA = /^[a-zA-Z0-9_-]{1,32}$/;
const HUELLA = /^[a-f0-9]{32}$/;
const TOKEN = /^[a-f0-9-]{36}$/;
/** Código de partida de un solo uso que genera el administrador. */
export const CODIGO_PARTIDA = /^[A-HJ-NP-Z2-9]{6}$/;

function esObjeto(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function esBool(v: unknown): v is boolean {
  return typeof v === "boolean";
}

function esEnteroEntre(v: unknown, min: number, max: number): v is number {
  return typeof v === "number" && Number.isInteger(v) && v >= min && v <= max;
}

export function validarEstado(v: unknown): EstadoJuego | null {
  if (!esObjeto(v)) return null;
  const c = v.comodinesUsados;
  if (!esObjeto(c)) return null;

  const {
    preguntaActualId,
    nivel,
    opcionesEliminadas,
    opcionSeleccionada,
    respuestaConfirmada,
    tiempoCorriendo,
    respuestaRevelada,
    resultado,
    distribucionAudiencia,
    sugerenciaAmigo,
    retirado,
    fase,
    participanteId,
  } = v;

  if (
    !(preguntaActualId === null ||
      (typeof preguntaActualId === "string" && ID_PREGUNTA.test(preguntaActualId))) ||
    !esEnteroEntre(nivel, 1, 15) ||
    !esBool(c.cincuentaCincuenta) ||
    !esBool(c.consultaProfesor) ||
    !esBool(c.preguntaAudiencia) ||
    !esBool(c.llamadaAmigo) ||
    !Array.isArray(opcionesEliminadas) ||
    opcionesEliminadas.length > 3 ||
    !opcionesEliminadas.every((i) => esEnteroEntre(i, 0, 3)) ||
    !(opcionSeleccionada === null || esEnteroEntre(opcionSeleccionada, 0, 3)) ||
    !esBool(respuestaConfirmada) ||
    !esBool(tiempoCorriendo) ||
    !esBool(respuestaRevelada) ||
    !(resultado === null || resultado === "correcto" || resultado === "incorrecto") ||
    !(
      distribucionAudiencia === null ||
      (Array.isArray(distribucionAudiencia) &&
        distribucionAudiencia.length === 4 &&
        distribucionAudiencia.every((p) => esEnteroEntre(p, 0, 100)))
    ) ||
    !(
      sugerenciaAmigo === null ||
      esSugerenciaAmigo(sugerenciaAmigo)
    ) ||
    !esBool(retirado) ||
    !(fase === "esperando" || fase === "jugando" || fase === "fin") ||
    !(participanteId === null ||
      (typeof participanteId === "string" && HUELLA.test(participanteId)))
  ) {
    return null;
  }

  return {
    preguntaActualId,
    nivel,
    comodinesUsados: {
      cincuentaCincuenta: c.cincuentaCincuenta,
      consultaProfesor: c.consultaProfesor,
      preguntaAudiencia: c.preguntaAudiencia,
      llamadaAmigo: c.llamadaAmigo,
    },
    opcionesEliminadas: [...opcionesEliminadas],
    opcionSeleccionada,
    respuestaConfirmada,
    tiempoCorriendo,
    respuestaRevelada,
    resultado,
    distribucionAudiencia: distribucionAudiencia ? [...distribucionAudiencia] : null,
    sugerenciaAmigo:
      sugerenciaAmigo === null
        ? null
        : { index: sugerenciaAmigo.index, confianza: sugerenciaAmigo.confianza },
    retirado,
    fase,
    participanteId,
  };
}

/** Solicitudes que el concursante puede enviar al administrador. */
export type Solicitud =
  | { tipo: "UNIRSE"; codigo: string }
  | { tipo: "PEDIR_ESTADO" }
  | { tipo: "SELECCIONAR_OPCION"; index: number }
  | { tipo: "CONFIRMAR_RESPUESTA" }
  | { tipo: "USAR_COMODIN_50_50" }
  | { tipo: "USAR_COMODIN_AUDIENCIA" }
  | { tipo: "USAR_COMODIN_LLAMADA" }
  | { tipo: "PLANTARSE" };

export type SolicitudFirmada = Solicitud & { token: string };

const TIPOS_SIN_DATOS = new Set([
  "PEDIR_ESTADO",
  "CONFIRMAR_RESPUESTA",
  "USAR_COMODIN_50_50",
  "USAR_COMODIN_AUDIENCIA",
  "USAR_COMODIN_LLAMADA",
  "PLANTARSE",
]);

export function validarSolicitud(v: unknown): SolicitudFirmada | null {
  if (!esObjeto(v)) return null;
  const { tipo, token, codigo } = v;
  if (typeof token !== "string" || !TOKEN.test(token)) return null;
  if (tipo === "UNIRSE") {
    return typeof codigo === "string" && CODIGO_PARTIDA.test(codigo)
      ? { tipo, codigo, token }
      : null;
  }
  if (tipo === "SELECCIONAR_OPCION") {
    return esEnteroEntre(v.index, 0, 3) ? { tipo, index: v.index, token } : null;
  }
  if (typeof tipo === "string" && TIPOS_SIN_DATOS.has(tipo)) {
    return { tipo, token } as SolicitudFirmada;
  }
  return null;
}

/** Huella pública del token secreto del concursante (SHA-256, 32 hex). */
export async function huellaDeToken(token: string): Promise<string> {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}
