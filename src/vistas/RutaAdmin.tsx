import React from "react";
import { Navigate } from "react-router-dom";
import { useSesionAdmin } from "../hooks/useSesionAdmin";

/** Protege la consola del presentador: sin sesión válida redirige al login. */
export const RutaAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { cargando, sesion } = useSesionAdmin();

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-studio text-cyan-200 text-sm font-bold">
        Verificando sesión...
      </div>
    );
  }
  if (!sesion) return <Navigate to="/login" replace />;
  return <>{children}</>;
};
