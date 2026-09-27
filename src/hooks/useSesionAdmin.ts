import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export type EstadoSesion =
  | { cargando: true; sesion: null }
  | { cargando: false; sesion: Session | null };

/** Sesión de administrador (Supabase Auth). Las sesiones anónimas no cuentan. */
export function useSesionAdmin(): EstadoSesion {
  const [estado, setEstado] = useState<EstadoSesion>({ cargando: true, sesion: null });

  useEffect(() => {
    if (!supabase) {
      setEstado({ cargando: false, sesion: null });
      return;
    }
    const filtrar = (s: Session | null) => (s && !s.user.is_anonymous ? s : null);

    // getUser() valida el token contra el servidor (no solo lo lee del almacenamiento).
    void supabase.auth.getUser().then(async ({ data, error }) => {
      if (error || !data.user) {
        setEstado({ cargando: false, sesion: null });
        return;
      }
      const { data: s } = await supabase!.auth.getSession();
      setEstado({ cargando: false, sesion: filtrar(s.session) });
    });

    const { data } = supabase.auth.onAuthStateChange((evento, s) => {
      // La sesión inicial ya se valida arriba con getUser().
      if (evento === "INITIAL_SESSION") return;
      setEstado({ cargando: false, sesion: filtrar(s) });
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return estado;
}
