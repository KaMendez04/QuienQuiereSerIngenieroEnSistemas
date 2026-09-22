import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
export const CHANNEL_NAME =
  (import.meta.env.VITE_SUPABASE_CHANNEL_NAME as string | undefined) ??
  "quien-quiere-ser-ing";

export const supabase =
  url && anonKey
    ? createClient(url, anonKey, {
        realtime: { params: { eventsPerSecond: 20 } },
      })
    : null;
