import { useEffect, useRef } from "react";
import { Howler } from "howler";

function tone(
  freq: number,
  dur: number,
  type: OscillatorType,
  gain = 0.15,
  delay = 0,
): void {
  const ctx = Howler.ctx as AudioContext | undefined;
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(g).connect(ctx.destination);
  const t0 = ctx.currentTime + delay;
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.start(t0);
  osc.stop(t0 + dur);
}

export type Sonido = "tic" | "acierto" | "error" | "nivel" | "confirmar";

export function useSonidos(): (s: Sonido) => void {
  const ticRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (ticRef.current) clearInterval(ticRef.current);
    };
  }, []);

  return (sonido: Sonido) => {
    Howler.autoUnlock = true;
    switch (sonido) {
      case "tic":
        if (!ticRef.current) {
          ticRef.current = setInterval(
            () => tone(1200, 0.06, "square", 0.05),
            1000,
          );
        }
        break;
      case "confirmar":
        tone(700, 0.15, "sine", 0.2);
        tone(900, 0.15, "sine", 0.2, 0.15);
        break;
      case "acierto":
        [523, 659, 784, 1047].forEach((f, i) =>
          tone(f, 0.3, "triangle", 0.2, i * 0.12),
        );
        break;
      case "error":
        [400, 300, 200].forEach((f, i) =>
          tone(f, 0.4, "sawtooth", 0.2, i * 0.2),
        );
        break;
      case "nivel":
        [523, 587, 659, 784, 880, 1047].forEach((f, i) =>
          tone(f, 0.25, "triangle", 0.18, i * 0.1),
        );
        break;
    }
  };
}
