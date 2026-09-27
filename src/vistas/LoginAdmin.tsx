import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { LockKeyhole, ArrowLeft } from "lucide-react";
import { LogoMillonario } from "../components/LogoMillonario";
import { supabase, RUTA_ADMIN } from "../lib/supabase";
import { useSesionAdmin } from "../hooks/useSesionAdmin";

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;

export const LoginAdmin: React.FC = () => {
  const navigate = useNavigate();
  const { cargando, sesion } = useSesionAdmin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (!cargando && sesion) return <Navigate to={RUTA_ADMIN} replace />;

  const iniciarSesion = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setError(null);
    const correo = email.trim().toLowerCase();
    if (!EMAIL.test(correo) || password.length < 6 || password.length > 128) {
      setError("Credenciales inválidas.");
      return;
    }
    if (!supabase) {
      setError("El servicio de autenticación no está configurado.");
      return;
    }
    setEnviando(true);
    const { error: err } = await supabase.auth.signInWithPassword({
      email: correo,
      password,
    });
    setEnviando(false);
    if (err) {
      // Mensaje genérico: no revela si el correo existe.
      setError("Credenciales inválidas.");
      setPassword("");
      return;
    }
    navigate(RUTA_ADMIN, { replace: true });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-studio text-white p-4">
      <form
        onSubmit={iniciarSesion}
        className="flex flex-col items-center w-full max-w-sm md:max-w-md p-8 rounded-3xl border-2 border-amber-500/60 bg-gradient-to-b from-[#0e174a] via-[#080d33] to-[#03051c] shadow-[0_0_40px_rgba(255,180,0,0.3)]"
      >
        <LogoMillonario size={110} textoPrincipal="INGENIERO" className="mb-3" />
        <h1 className="flex items-center gap-2 text-xl font-black uppercase tracking-wider text-amber-300 mb-6">
          <LockKeyhole size={20} /> Acceso Administrador
        </h1>

        <label className="w-full text-xs font-bold text-cyan-200 mb-1" htmlFor="email">
          Correo
        </label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          required
          maxLength={320}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded-lg bg-blue-950/80 border border-blue-600 text-white focus:outline-none focus:border-amber-400"
        />

        <label className="w-full text-xs font-bold text-cyan-200 mb-1" htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={128}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded-lg bg-blue-950/80 border border-blue-600 text-white focus:outline-none focus:border-amber-400"
        />

        {error && (
          <p role="alert" className="w-full mb-4 text-xs font-bold text-rose-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="w-full py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black text-sm uppercase tracking-wider disabled:opacity-50 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
        >
          {enviando ? "Verificando..." : "Ingresar"}
        </button>

        <Link
          to="/"
          className="flex items-center gap-1 mt-5 text-xs text-cyan-200/80 hover:text-cyan-100"
        >
          <ArrowLeft size={14} /> Volver
        </Link>
      </form>
    </div>
  );
};
