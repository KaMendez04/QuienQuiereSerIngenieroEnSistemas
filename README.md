# ¿Quién Quiere Ser Ingeniero en Sistemas?

Aplicación web para el carnaval de la carrera de Ingeniería en Sistemas (UNA, Costa Rica),
inspirada en "¿Quién Quiere Ser Millonario?". Sincronización en tiempo real vía
**Supabase Realtime** (canales privados con RLS) y **Supabase Auth** para el administrador.

## Vistas (rutas)

| Ruta             | Acceso             | Descripción                                                          |
| ---------------- | ------------------ | -------------------------------------------------------------------- |
| `/`              | Público            | Elegir: entrar como administrador o como concursante                 |
| `/login`         | Público            | Inicio de sesión del administrador (correo + contraseña)             |
| `/4dm1n1str4d0r` | Solo administrador | Consola del presentador (redirige a `/login` sin sesión)             |
| `/participante`  | Un solo concursante | Pantalla del concursante. Si ya hay alguien jugando, muestra "La partida ya empezó" |

### Un solo concursante por partida

El primer dispositivo que entra a `/participante` mientras el administrador tiene la consola
abierta queda asignado como concursante. Cualquier otro que abra la ruta ve
**"La partida ya empezó"**. Recargar la pestaña conserva el puesto. El administrador puede
usar **Liberar Concursante** para reiniciar y dejar entrar a otra persona.

## Puesta en marcha

```bash
npm install
cp .env.example .env   # y completa los valores
npm run dev
```

## Configuración de Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com) (plan gratuito funciona).
2. En _Project Settings → API_ copia la **Project URL** y la **anon public key** al `.env`:

```
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_ANON_KEY
VITE_SUPABASE_CHANNEL_NAME=quien-quiere-ser-ing
```

3. **Autorización de Realtime**: ejecuta
   `supabase/migrations/20260923000000_realtime_autorizacion.sql` en el _SQL Editor_
   (o con `supabase db push`). Si cambias `VITE_SUPABASE_CHANNEL_NAME`, cambia también los
   nombres de canal dentro del SQL.
4. En _Realtime → Settings_ desactiva **"Allow public access"** para que solo se puedan
   usar canales privados.
5. **Usuario administrador**: en _Authentication → Users → Add user_ crea el usuario con
   correo y contraseña (marca "Auto confirm").
6. En _Authentication → Sign In / Providers_ **desactiva "Allow new users to sign up"** y
   deja desactivado el inicio de sesión anónimo. Así solo existen los administradores que
   tú crees.

## Seguridad

- **Rutas**: la consola del presentador exige una sesión válida de Supabase Auth
  (validada con el servidor). Pero la protección real está en el servidor: aunque alguien
  abra la ruta o modifique el JavaScript, las políticas RLS impiden publicar el estado del
  juego o leer las solicitudes si no es un usuario autenticado.
- **El administrador es la única fuente de verdad**: el concursante solo envía
  solicitudes (seleccionar, confirmar, comodines, plantarse). El administrador las valida
  (forma exacta, rango de valores, límite por segundo) y solo acepta las del concursante
  asignado (token secreto por pestaña; solo el administrador lo puede leer). El 50:50 y el
  voto del público se calculan en el administrador.
- **XSS**: React escapa todo el texto; no se usa `dangerouslySetInnerHTML` ni `eval`.
  Todo el estado recibido por la red o leído de `localStorage` se valida y reconstruye
  campo por campo. El build de producción incluye una Content-Security-Policy que solo
  permite scripts propios y conexiones a Supabase.
- **SQL injection**: la app no ejecuta SQL; el cliente de Supabase usa la API con
  parámetros y las políticas RLS no interpolan datos del usuario.
- **Prompt injection**: la app no usa modelos de lenguaje, así que no hay superficie
  de ataque de este tipo.
- **Limitación conocida**: el banco de preguntas (con la respuesta correcta) viaja dentro
  del JavaScript, por lo que alguien con conocimientos técnicos podría verlo en las
  herramientas de desarrollador. Para evitarlo habría que mover las preguntas a una tabla
  de Supabase con RLS.

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

- **Reducer puro**: `src/game/reducer.ts` aplica las acciones en el administrador, que
  publica el estado completo al concursante. Es testeable y no depende de Supabase.
- **Confirmación en dos pasos**: el concursante _marca_ (`SELECCIONAR_OPCION`) y
  luego _confirma_ (`CONFIRMAR_RESPUESTA`); solo tras confirmar se puede revelar.
- **Consultar con un profesor** es solo una pausa visual (comodín marcado como usado).
- **Sonidos** generados con WebAudio a través de Howler (sin archivos de audio:
  tic-tac, acierto, error y fanfarria de nivel).

## Stack

React 18 + Vite + TypeScript · Tailwind CSS · Framer Motion · Howler.js · Supabase Realtime.
