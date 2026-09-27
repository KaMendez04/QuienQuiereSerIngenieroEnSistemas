import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { reducer, estadoInicial, opcionesIncorrectas, generarDistribucionAudiencia, generarSugerenciaAmigo, type Accion } from "../game/reducer";
import type { EstadoJuego, Pregunta } from "../game/tipos";
import {
  validarEstado,
  validarSolicitud,
  huellaDeToken,
  type Solicitud,
} from "../game/validacion";

/* Genera un código de partida de 6 caracteres, sin caracteres ambiguos
 * (sin I, O, 0, 1) para que sea fácil de leer en voz alta. */
const ALFABETO_CODIGO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function generarCodigoPartida(): string {
  let codigo = "";
  const valores = crypto.getRandomValues(new Uint32Array(6));
  for (let i = 0; i < 6; i++) {
    codigo += ALFABETO_CODIGO[valores[i] % ALFABETO_CODIGO.length];
  }
  return codigo;
}
import { conectarCanal, supabase, TOPIC_ESTADO, TOPIC_SOLICITUDES } from "../lib/supabase";
import preguntas from "../data/preguntas.json";

/*
 * Arquitectura:
 *  - El administrador es la ÚNICA fuente de verdad. Aplica el reducer y publica el
 *    estado completo en el canal privado TOPIC_ESTADO (solo él puede escribir, RLS).
 *  - El concursante nunca modifica el estado: envía "solicitudes" al canal privado
 *    TOPIC_SOLICITUDES (solo el administrador puede leerlo, RLS). El administrador las
 *    valida, comprueba que vienen del concursante asignado y decide si aplicarlas.
 *  - Solo se admite un concursante: el primero que se une queda asignado hasta que el
 *    administrador lo libere.
 */

const banco = preguntas as Pregunta[];

const CLAVE_ESTADO_ADMIN = "millonario_estado_admin";
const CLAVE_TOKEN_CONCURSANTE = "millonario_token_concursante";
const LATIDO_MS = 4000;
const ADMIN_AUSENTE_MS = 12000;
const MAX_SOLICITUDES_POR_SEGUNDO = 30;

function buscarPregunta(id: string | null): Pregunta | null {
  return banco.find((p) => p.id === id) ?? null;
}

function cargarEstadoAdmin(): EstadoJuego {
  try {
    const guardado = localStorage.getItem(CLAVE_ESTADO_ADMIN);
    if (guardado) return validarEstado(JSON.parse(guardado)) ?? estadoInicial;
  } catch {
    // Almacenamiento no disponible o corrupto: se empieza de cero.
  }
  return estadoInicial;
}

function obtenerTokenConcursante(): string {
  try {
    const guardado = sessionStorage.getItem(CLAVE_TOKEN_CONCURSANTE);
    if (guardado && /^[a-f0-9-]{36}$/.test(guardado)) return guardado;
    const nuevo = crypto.randomUUID();
    sessionStorage.setItem(CLAVE_TOKEN_CONCURSANTE, nuevo);
    return nuevo;
  } catch {
    return crypto.randomUUID();
  }
}

/* ------------------------------------------------------------------ */
/* ADMINISTRADOR                                                       */
/* ------------------------------------------------------------------ */

export interface UseJuegoAdmin {
  estado: EstadoJuego;
  emitir: (accion: Accion) => void;
  preguntaActual: Pregunta | null;
  banco: Pregunta[];
  participanteConectado: boolean;
  /** Código de partida vigente (null = ya usado, hay que generar otro). */
  codigoPartida: string | null;
  generarCodigo: () => void;
}

export function useJuegoAdmin(): UseJuegoAdmin {
  const [estado, setEstado] = useState<EstadoJuego>(cargarEstadoAdmin);
  const [presentes, setPresentes] = useState<Set<string>>(new Set());
  const estadoRef = useRef(estado);
  const canalEstadoRef = useRef<RealtimeChannel | null>(null);

  /* Código de partida de un solo uso: vive SOLO en el administrador (nunca se
   * publica por Realtime). Se consume al asignar al concursante. */
  const [codigoPartida, setCodigoPartida] = useState<string | null>(null);
  const codigoRef = useRef<string | null>(null);
  const generarCodigo = useCallback(() => {
    const nuevo = generarCodigoPartida();
    codigoRef.current = nuevo;
    setCodigoPartida(nuevo);
  }, []);
  useEffect(() => {
    generarCodigo();
  }, [generarCodigo]);

  const publicar = useCallback((e: EstadoJuego) => {
    canalEstadoRef.current?.send({
      type: "broadcast",
      event: "estado",
      payload: { estado: e },
    });
  }, []);

  const emitir = useCallback(
    (accion: Accion) => {
      const nuevo = reducer(estadoRef.current, accion);
      if (nuevo === estadoRef.current) return;
      estadoRef.current = nuevo;
      setEstado(nuevo);
      try {
        localStorage.setItem(CLAVE_ESTADO_ADMIN, JSON.stringify(nuevo));
      } catch {
        // Sin persistencia local; el juego sigue funcionando.
      }
      publicar(nuevo);
      /* Al liberar al concursante o reiniciar la partida se genera un código
       * nuevo: el anterior ya se consumió y el puesto vuelve a estar libre. */
      if (
        accion.type === "LIBERAR_PARTICIPANTE" ||
        accion.type === "REINICIAR_JUEGO"
      ) {
        generarCodigo();
      }
    },
    [publicar, generarCodigo],
  );

  // Canal de estado: el administrador publica y envía un latido periódico.
  useEffect(() => {
    if (!supabase) return;
    const cliente = supabase;
    const cerrar = conectarCanal(
      cliente,
      TOPIC_ESTADO,
      { broadcast: { self: false } },
      (canal) => {
        canalEstadoRef.current = canal;
      },
      (estadoCanal) => {
        if (estadoCanal === "SUBSCRIBED") publicar(estadoRef.current);
      },
    );
    const latido = setInterval(() => publicar(estadoRef.current), LATIDO_MS);
    return () => {
      clearInterval(latido);
      canalEstadoRef.current = null;
      cerrar();
    };
  }, [publicar]);

  // Canal de solicitudes: solo el administrador puede leerlo.
  useEffect(() => {
    if (!supabase) return;
    const cliente = supabase;
    let ventana = { inicio: 0, cantidad: 0 };

    const procesar = async (crudo: unknown) => {
      const ahora = Date.now();
      if (ahora - ventana.inicio > 1000) ventana = { inicio: ahora, cantidad: 0 };
      if (++ventana.cantidad > MAX_SOLICITUDES_POR_SEGUNDO) return;

      const s = validarSolicitud(crudo);
      if (!s) return;
      const huella = await huellaDeToken(s.token);
      const e = estadoRef.current;

      if (s.tipo === "PEDIR_ESTADO") {
        publicar(e);
        return;
      }
      if (s.tipo === "UNIRSE") {
        /* Solo se une quien presente el código de partida vigente; el código
         * se consume con el primer uso correcto (vale una sola vez). */
        if (!codigoRef.current || s.codigo !== codigoRef.current) {
          publicar(e);
          return;
        }
        if (e.participanteId === null) {
          codigoRef.current = null;
          setCodigoPartida(null);
          emitir({ type: "ASIGNAR_PARTICIPANTE", participanteId: huella });
        } else {
          publicar(e);
        }
        return;
      }

      // El resto de solicitudes solo se aceptan del concursante asignado.
      if (huella !== e.participanteId) return;
      const pregunta = buscarPregunta(e.preguntaActualId);

      switch (s.tipo) {
        case "SELECCIONAR_OPCION":
          emitir({ type: "SELECCIONAR_OPCION", index: s.index });
          break;
        case "CONFIRMAR_RESPUESTA":
          emitir({ type: "CONFIRMAR_RESPUESTA" });
          break;
        case "USAR_COMODIN_50_50":
          if (pregunta)
            emitir({
              type: "USAR_COMODIN_50_50",
              opcionesEliminadas: opcionesIncorrectas(pregunta),
            });
          break;
        case "USAR_COMODIN_AUDIENCIA":
          if (pregunta)
            emitir({
              type: "USAR_COMODIN_AUDIENCIA",
              distribucion: generarDistribucionAudiencia(pregunta.correctaIndex),
            });
          break;
        case "USAR_COMODIN_LLAMADA":
          if (pregunta)
            emitir({
              type: "USAR_COMODIN_LLAMADA",
              sugerencia: generarSugerenciaAmigo(pregunta.correctaIndex),
            });
          break;
        case "PLANTARSE":
          emitir({ type: "PLANTARSE" });
          break;
      }
    };

    /* Oyentes de solicitudes y presencia; se registran en cada canal que
     * venga a estar activo (privado o su respaldo público). */
    const registrarOyentes = (canal: RealtimeChannel) => {
      canal
        .on("broadcast", { event: "solicitud" }, ({ payload }) => {
          void procesar(payload);
        })
        .on("presence", { event: "sync" }, () => {
          const ids = new Set<string>();
          for (const lista of Object.values(canal.presenceState())) {
            for (const p of lista as Array<Record<string, unknown>>) {
              if (typeof p.id === "string") ids.add(p.id);
            }
          }
          setPresentes(ids);
        });
    };

    let canalActual: RealtimeChannel | null = null;
    const cerrar = conectarCanal(
      cliente,
      TOPIC_SOLICITUDES,
      { presence: { enabled: true } },
      (canal) => {
        if (canalActual && canalActual !== canal) {
          cliente.removeChannel(canalActual);
        }
        registrarOyentes(canal);
        canalActual = canal;
      },
    );

    return () => {
      cerrar();
    };
  }, [emitir, publicar]);

  return {
    estado,
    emitir,
    preguntaActual: buscarPregunta(estado.preguntaActualId),
    banco,
    participanteConectado:
      estado.participanteId !== null && presentes.has(estado.participanteId),
    codigoPartida,
    generarCodigo,
  };
}

/* ------------------------------------------------------------------ */
/* CONCURSANTE                                                         */
/* ------------------------------------------------------------------ */

export interface UseJuegoParticipante {
  /** null mientras no se ha recibido estado del administrador. */
  estado: EstadoJuego | null;
  adminConectado: boolean;
  /** Este dispositivo es el concursante asignado. */
  soyParticipante: boolean;
  preguntaActual: Pregunta | null;
  enviar: (s: Solicitud) => void;
  /** El código de partida fue rechazado, ya se usó o expiró. */
  codigoRechazado: boolean;
}

export function useJuegoParticipante(
  codigo: string | null,
): UseJuegoParticipante {
  const [token] = useState(obtenerTokenConcursante);
  const [huella, setHuella] = useState<string | null>(null);
  const [estado, setEstado] = useState<EstadoJuego | null>(null);
  const [adminConectado, setAdminConectado] = useState(false);
  const [codigoRechazado, setCodigoRechazado] = useState(false);
  const canalSolicitudesRef = useRef<RealtimeChannel | null>(null);
  const ultimoUnirseRef = useRef(0);
  const asignadoRef = useRef(false);

  useEffect(() => {
    let activo = true;
    void huellaDeToken(token).then((h) => activo && setHuella(h));
    return () => {
      activo = false;
    };
  }, [token]);

  /* Al cambiar el código (o reintentarlo) se limpia el aviso de rechazo. */
  useEffect(() => {
    setCodigoRechazado(false);
    asignadoRef.current = false;
  }, [codigo]);

  const enviar = useCallback(
    (s: Solicitud) => {
      canalSolicitudesRef.current?.send({
        type: "broadcast",
        event: "solicitud",
        payload: { ...s, token },
      });
    },
    [token],
  );

  useEffect(() => {
    if (!supabase || !huella) return;
    const cliente = supabase;
    let temporizadorAusencia: ReturnType<typeof setTimeout> | undefined;

    /* Oyentes de estado; se registran en el canal que venga a estar activo
     * (privado o su respaldo público). */
    const registrarEstado = (canal: RealtimeChannel) => {
      canal.on("broadcast", { event: "estado" }, ({ payload }) => {
        const nuevo = validarEstado((payload as { estado?: unknown })?.estado);
        if (!nuevo) return;
        setEstado(nuevo);
        setAdminConectado(true);
        clearTimeout(temporizadorAusencia);
        temporizadorAusencia = setTimeout(
          () => setAdminConectado(false),
          ADMIN_AUSENTE_MS,
        );
        if (nuevo.participanteId === huella) {
          asignadoRef.current = true;
          return;
        }
        /* Si el puesto está libre y hay código de partida, se solicita entrar
         * (con reintentos espaciados); sin código no se intenta unirse. */
        if (
          nuevo.participanteId === null &&
          codigo &&
          Date.now() - ultimoUnirseRef.current > 2500
        ) {
          ultimoUnirseRef.current = Date.now();
          enviar({ tipo: "UNIRSE", codigo });
          /* Si en unos segundos nadie asignó este dispositivo, el código
           * ya se usó o no es válido. */
          setTimeout(() => {
            if (!asignadoRef.current) setCodigoRechazado(true);
          }, 5000);
        }
      });
    };

    let canalEstadoActual: RealtimeChannel | null = null;
    const cerrarEstado = conectarCanal(
      cliente,
      TOPIC_ESTADO,
      {},
      (canal) => {
        if (canalEstadoActual && canalEstadoActual !== canal) {
          cliente.removeChannel(canalEstadoActual);
        }
        registrarEstado(canal);
        canalEstadoActual = canal;
      },
    );

    /* Canal de solicitudes: aquí el concursante envía sus acciones y su
     * presencia (usando su huella como clave para que el admin la vea). */
    const canalSolicitudes = cliente.channel(TOPIC_SOLICITUDES, {
      config: { presence: { key: huella } },
    });
    canalSolicitudes.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        canalSolicitudesRef.current = canalSolicitudes;
        void canalSolicitudes.track({ id: huella });
        enviar({ tipo: "PEDIR_ESTADO" });
      }
    });

    return () => {
      clearTimeout(temporizadorAusencia);
      cerrarEstado();
      canalSolicitudesRef.current = null;
      cliente.removeChannel(canalSolicitudes);
    };
  }, [huella, enviar, codigo]);

  return {
    estado,
    adminConectado,
    soyParticipante: estado !== null && huella !== null && estado.participanteId === huella,
    preguntaActual: buscarPregunta(estado?.preguntaActualId ?? null),
    enviar,
    codigoRechazado,
  };
}
