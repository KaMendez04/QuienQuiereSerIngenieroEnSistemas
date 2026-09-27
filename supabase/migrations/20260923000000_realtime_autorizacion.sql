-- Autorización de Realtime para "¿Quién Quiere Ser Ingeniero en Sistemas?"
--
-- Los nombres de los canales DEBEN coincidir con VITE_SUPABASE_CHANNEL_NAME
-- (por defecto "quien-quiere-ser-ing"): <canal>-estado y <canal>-solicitudes.
--
-- Modelo:
--   <canal>-estado       : todos pueden LEER; solo el administrador (usuario autenticado,
--                          no anónimo) puede PUBLICAR el estado del juego.
--   <canal>-solicitudes  : el concursante puede ENVIAR solicitudes y presencia;
--                          solo el administrador puede LEERLAS.
--
-- Estas políticas no usan ningún dato del usuario en SQL dinámico: no hay superficie
-- de inyección SQL.

drop policy if exists "qqsi: leer estado" on realtime.messages;
drop policy if exists "qqsi: admin publica estado" on realtime.messages;
drop policy if exists "qqsi: concursante envia solicitudes" on realtime.messages;
drop policy if exists "qqsi: admin lee solicitudes" on realtime.messages;

create policy "qqsi: leer estado"
on realtime.messages for select
to anon, authenticated
using (
  (select realtime.topic()) = 'quien-quiere-ser-ing-estado'
  and realtime.messages.extension = 'broadcast'
);

create policy "qqsi: admin publica estado"
on realtime.messages for insert
to authenticated
with check (
  (select realtime.topic()) = 'quien-quiere-ser-ing-estado'
  and realtime.messages.extension = 'broadcast'
  and coalesce((select auth.jwt() ->> 'is_anonymous')::boolean, false) = false
);

create policy "qqsi: concursante envia solicitudes"
on realtime.messages for insert
to anon, authenticated
with check (
  (select realtime.topic()) = 'quien-quiere-ser-ing-solicitudes'
  and realtime.messages.extension in ('broadcast', 'presence')
);

create policy "qqsi: admin lee solicitudes"
on realtime.messages for select
to authenticated
using (
  (select realtime.topic()) = 'quien-quiere-ser-ing-solicitudes'
  and realtime.messages.extension in ('broadcast', 'presence')
  and coalesce((select auth.jwt() ->> 'is_anonymous')::boolean, false) = false
);
