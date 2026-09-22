# ¿Quién Quiere Ser Ingeniero en Sistemas?

Aplicación web para el carnaval de la carrera de Ingeniería en Sistemas (UNA, Costa Rica),
inspirada en "¿Quién Quiere Ser Millonario?". Tres vistas sincronizadas en tiempo real vía
**Supabase Realtime Broadcast** (sin backend propio ni base de datos).

## Vistas (rutas)

| Ruta              | Dispositivo     | Descripción                                                                |
| ----------------- | --------------- | -------------------------------------------------------------------------- |
| `/host-preguntas` | Laptop/tablet 1 | Carga preguntas, inicia cronómetro, revela resultado, sube de nivel        |
| `/host-comodines` | Laptop/tablet 2 | Activa comodines (50:50, profesor, público), marca y confirma la respuesta |
| `/publico`        | Proyector       | Solo lectura: pregunta, opciones, comodines, escalera y resultado          |

## Puesta en marcha

```bash
npm install
cp .env.example .env   # y completa los valores
npm run dev
```

## Configuración de Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com) (plan gratuito funciona).
2. **No necesitas crear tablas ni autenticación.** Solo se usa Realtime Broadcast,
   que funciona sobre canales efímeros sin persistencia.
3. En _Project Settings → API_ copia la **Project URL** y la **anon public key**.
4. Crea `.env` con:

```
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_ANON_KEY
VITE_SUPABASE_CHANNEL_NAME=quien-quiere-ser-ing
```

Los tres dispositivos (dos hosts y el proyector) deben abrir la app del mismo despliegue
con el mismo canal. Para el evento en vivo basta un hotspot móvil: los payloads de
broadcast son acciones pequeñas (deltas), no el estado completo.

## Banco de preguntas

Edita `src/data/preguntas.json` sin tocar código. Estructura:

```json
{
  "id": "p01",
  "nivel": 1,
  "categoria": "carrera",
  "texto": "...",
  "opciones": ["A", "B", "C", "D"],
  "correctaIndex": 1
}
```

## Decisiones de diseño (ambigüedades resueltas)

- **Acciones, no estado compartido**: cada host emite acciones (`AVANZAR_PREGUNTA`,
  `USAR_COMODIN_50_50`, etc.); un reducer puro en `src/game/reducer.ts` las aplica en
  los tres clientes, garantizando el mismo estado resultante. Es testeable y no depende
  de Supabase.
- **Deltas deterministas**: el 50:50 y la distribución del público se calculan en el
  host que emite y viajan dentro de la acción (evita divergencia por aleatoriedad local).
- **Confirmación en dos pasos**: el host de comodines _marca_ (`SELECCIONAR_OPCION`) y
  luego _confirma_ (`CONFIRMAR_RESPUESTA`); solo tras confirmar se puede revelar.
- **Consultar con un profesor** es solo una pausa visual (comodín marcado como usado).
- **Sonidos** generados con WebAudio a través de Howler (sin archivos de audio:
  tic-tac, acierto, error y fanfarria de nivel).

## Stack

React 18 + Vite + TypeScript · Tailwind CSS · Framer Motion · Howler.js · Supabase Realtime.
