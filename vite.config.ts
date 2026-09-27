import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

/**
 * Content-Security-Policy para el build de producción (mitiga XSS: solo se
 * ejecutan scripts propios y solo se conecta a Supabase). En desarrollo no se
 * aplica porque Vite inyecta scripts inline para el recargado en caliente.
 */
function politicaSeguridad(supabaseUrl: string | undefined): Plugin {
  let origenSupabase = "";
  try {
    const u = new URL(supabaseUrl ?? "");
    origenSupabase = `${u.origin} wss://${u.host}`;
  } catch {
    // Sin URL válida: solo se permite el propio origen.
  }
  const csp = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    `connect-src 'self' ${origenSupabase}`.trim(),
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  return {
    name: "politica-seguridad",
    apply: "build",
    transformIndexHtml() {
      return [
        { tag: "meta", attrs: { "http-equiv": "Content-Security-Policy", content: csp }, injectTo: "head-prepend" },
        { tag: "meta", attrs: { name: "referrer", content: "no-referrer" }, injectTo: "head" },
      ];
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  return {
    plugins: [react(), politicaSeguridad(env.VITE_SUPABASE_URL)],
    css: {
      postcss: {
        plugins: [tailwindcss(), autoprefixer()],
      },
    },
  };
});
