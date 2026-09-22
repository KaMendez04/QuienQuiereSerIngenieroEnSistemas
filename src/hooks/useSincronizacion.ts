import { useCallback, useEffect, useReducer, useRef } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { reducer, estadoInicial, type Accion } from "../game/reducer";
import type { EstadoJuego, Pregunta } from "../game/tipos";
import { supabase, CHANNEL_NAME } from "../lib/supabase";
import preguntas from "../data/preguntas.json";

const banco = preguntas as Pregunta[];

type Msg = { accion: Accion };
type MsgEstado = { estado: EstadoJuego };

const LOCAL_STORAGE_KEY = "millonario_game_state";
const BROADCAST_NAME = "millonario_sync_channel";

function obtenerEstadoInicial(): EstadoJuego {
  try {
    const guardado = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (guardado) {
      return JSON.parse(guardado);
    }
  } catch (e) {
    console.error("Error leyendo estado inicial de localStorage", e);
  }
  return estadoInicial;
}

export interface UseSincronizacion {
  estado: EstadoJuego;
  emitir: (accion: Accion) => void;
  preguntaActual: Pregunta | null;
  banco: Pregunta[];
}

export function useSincronizacion(rol: "admin" | "participante" = "participante"): UseSincronizacion {
  const canalSupabaseRef = useRef<RealtimeChannel | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  const [estado, dispatch] = useReducer(
    (e: EstadoJuego, a: Accion) => {
      const nuevo = reducer(e, a);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nuevo));
      } catch (err) {
        console.error("Error guardando en localStorage", err);
      }
      return nuevo;
    },
    undefined,
    obtenerEstadoInicial,
  );

  const estadoRef = useRef(estado);
  estadoRef.current = estado;

  // Sincronización local vía BroadcastChannel (Instantáneo para pestañas locales)
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(BROADCAST_NAME);
      broadcastChannelRef.current = bc;

      bc.onmessage = (event) => {
        const data = event.data;
        if (data?.type === "accion" && data.accion) {
          dispatch(data.accion);
        } else if (data?.type === "estado" && data.estado) {
          dispatch({ type: "SINCRONIZAR_ESTADO", estado: data.estado });
        } else if (data?.type === "pedir-estado") {
          bc?.postMessage({ type: "estado", estado: estadoRef.current });
        }
      };

      // Solicitar estado actual al abrir la pestaña
      bc.postMessage({ type: "pedir-estado" });
    } catch (e) {
      console.warn("BroadcastChannel no soportado", e);
    }

    return () => {
      if (bc) {
        bc.close();
      }
    };
  }, []);

  // Sincronización remota vía Supabase Realtime
  useEffect(() => {
    if (!supabase) {
      return;
    }
    const cliente = supabase;
    const canal = cliente.channel(CHANNEL_NAME, {
      config: { broadcast: { self: false } },
    });

    canal
      .on("broadcast", { event: "accion" }, ({ payload }) => {
        const msg = payload as Msg;
        if (msg?.accion) dispatch(msg.accion);
      })
      .on("broadcast", { event: "estado" }, ({ payload }) => {
        const msg = payload as MsgEstado;
        if (msg?.estado)
          dispatch({ type: "SINCRONIZAR_ESTADO", estado: msg.estado });
      })
      .on("broadcast", { event: "pedir-estado" }, () => {
        if (rol === "admin") {
          canal.send({
            type: "broadcast",
            event: "estado",
            payload: { estado: estadoRef.current } satisfies MsgEstado,
          });
        }
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          canalSupabaseRef.current = canal;
          canal.send({
            type: "broadcast",
            event: "pedir-estado",
            payload: {},
          });
        }
      });

    return () => {
      if (cliente) cliente.removeChannel(canal);
      canalSupabaseRef.current = null;
    };
  }, [rol]);

  const emitir = useCallback(
    (accion: Accion) => {
      dispatch(accion);

      // 1. Emitir a BroadcastChannel local
      try {
        broadcastChannelRef.current?.postMessage({
          type: "accion",
          accion,
        });
      } catch (e) {
        console.error("Error emitiendo a BroadcastChannel", e);
      }

      // 2. Emitir a Supabase Realtime
      if (canalSupabaseRef.current) {
        canalSupabaseRef.current.send({
          type: "broadcast",
          event: "accion",
          payload: { accion } satisfies Msg,
        });
      }
    },
    [],
  );

  const preguntaActual =
    banco.find((p) => p.id === estado.preguntaActualId) ?? null;

  return { estado, emitir, preguntaActual, banco };
}
