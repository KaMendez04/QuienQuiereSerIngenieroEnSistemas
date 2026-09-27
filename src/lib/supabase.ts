import { createClient, type RealtimeChannel } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const nombreCanal =
  (import.meta.env.VITE_SUPABASE_CHANNEL_NAME as string | undefined) ??
  "quien-quiere-ser-ing";

// Solo caracteres seguros en el nombre del canal (debe coincidir con las políticas RLS).
export const CHANNEL_NAME = /^[a-z0-9-]{1,60}$/.test(nombreCanal)
  ? nombreCanal
  : "quien-quiere-ser-ing";

// Canal privado donde SOLO el administrador autenticado publica el estado del juego.
export const TOPIC_ESTADO = `${CHANNEL_NAME}-estado`;
// Canal privado donde el concursante envía solicitudes y SOLO el administrador las lee.
export const TOPIC_SOLICITUDES = `${CHANNEL_NAME}-solicitudes`;

// Ruta de la consola del presentador.
export const RUTA_ADMIN = "/4dm1n1str4d0r";

export type EstadoCanal = "SUBSCRIBED" | "CHANNEL_ERROR" | "TIMED_OUT" | "CLOSED";

type ConfigCanal = {
  broadcast?: Record<string, unknown>;
  presence?: Record<string, unknown>;
};

/*
 * Suscribe un canal intentando el modo PRIVADO primero (con políticas RLS de
 * realtime.messages). Si el privado falla —p. ej. la migración de autorización
 * no se aplicó o los canales privados no están habilitados— reintenta en modo
 * PÚBLICO para que el juego siga funcionando. La identidad del concursante se
 * protege igual: token secreto + huella SHA-256 + código de partida de un solo uso.
 */
export function conectarCanal(
  cliente: NonNullable<typeof supabase>,
  topic: string,
  config: ConfigCanal,
  onCanal: (canal: RealtimeChannel) => void,
  onStatus?: (estado: EstadoCanal) => void,
): () => void {
  let activo: RealtimeChannel | null = null;
  let resuelto = false;
  const limpiar = () => {
    if (activo) {
      cliente.removeChannel(activo);
      activo = null;
    }
  };

  const privado = cliente.channel(topic, {
    config: { ...config, private: true },
  });
  activo = privado;
  onCanal(privado);

  const reintentarPublico = () => {
    limpiar();
    const publico = cliente.channel(topic, { config });
    activo = publico;
    onCanal(publico);
    publico.subscribe((estado) => {
      if (estado === "SUBSCRIBED") onStatus?.("SUBSCRIBED");
    });
  };

  privado.subscribe((estado) => {
    if (estado === "SUBSCRIBED") {
      resuelto = true;
      clearTimeout(vigilante);
      onStatus?.("SUBSCRIBED");
    } else if (estado === "CHANNEL_ERROR" || estado === "TIMED_OUT") {
      if (!resuelto) {
        resuelto = true;
        clearTimeout(vigilante);
        reintentarPublico();
      }
    }
  });

  /* Si en 5 segundos no hay confirmación, se asume bloqueo y se cae a público. */
  const vigilante = setTimeout(() => {
    if (!resuelto) {
      resuelto = true;
      reintentarPublico();
    }
  }, 5000);

  return limpiar;
}

export const supabase =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: { persistSession: true, autoRefreshToken: true },
        realtime: { params: { eventsPerSecond: 20 } },
      })
    : null;
