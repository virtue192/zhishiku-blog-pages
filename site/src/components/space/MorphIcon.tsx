import { useEffect, useRef } from "preact/hooks";
import { createMorph, type Morph } from "morphicons/dom";

export const paths = {
  home: "M3 10 L12 3 L21 10 M5 9 L5 21 L10 21 L10 15 L14 15 L14 21 L19 21 L19 9",
  book: "M12 5 C8 2 4 3 2 4 L2 20 C6 18 9 19 12 21 C15 19 18 18 22 20 L22 4 C18 2 15 3 12 5 L12 21",
  grid: "M3 3 L9 3 L9 9 L3 9 Z M15 3 L21 3 L21 9 L15 9 Z M3 15 L9 15 L9 21 L3 21 Z M15 15 L21 15 L21 21 L15 21 Z",
  compass:
    "M22 12 A10 10 0 1 1 2 12 A10 10 0 1 1 22 12 M16 8 L14 14 L8 16 L10 10 Z",
  mail: "M3 5 L21 5 L21 19 L3 19 Z M3 6 L12 13 L21 6",
  mailOpen:
    "M3 9 L12 3 L21 9 L21 21 L3 21 Z M3 9 L12 15 L21 9 M3 21 L9 14 M21 21 L15 14",
  search: "M17 10 A7 7 0 1 1 3 10 A7 7 0 1 1 17 10 M15 15 L21 21",
  close: "M5 5 L19 19 M19 5 L5 19",
  arrow: "M5 12 L19 12 M13 6 L19 12 L13 18",
  northeast: "M6 18 L18 6 M6 6 L18 6 L18 18",
  back: "M19 12 L5 12 M11 6 L5 12 L11 18",
  check: "M4 12 L9 17 L20 6",
  play: "M7 4 L20 12 L7 20 Z",
  pause: "M8 4 L8 20 M16 4 L16 20",
  sun: "M16 12 A4 4 0 1 1 8 12 A4 4 0 1 1 16 12 M12 1 L12 3 M12 21 L12 23 M1 12 L3 12 M21 12 L23 12 M4 4 L5.5 5.5 M18.5 18.5 L20 20 M4 20 L5.5 18.5 M18.5 5.5 L20 4",
  moon: "M20 15 A9 9 0 1 1 9 3 A7 7 0 0 0 20 15",
  volume:
    "M3 9 L7 9 L12 4 L12 20 L7 15 L3 15 Z M16 8 C19 10 19 14 16 16 M19 4 C25 8 25 16 19 20",
  muted: "M3 9 L7 9 L12 4 L12 20 L7 15 L3 15 Z M17 9 L23 15 M23 9 L17 15",
  settings: "M4 7 L20 7 M4 17 L20 17 M9 4 L9 10 M15 14 L15 20",
  spark:
    "M12 2 C12 8 8 12 2 12 C8 12 12 16 12 22 C12 16 16 12 22 12 C16 12 12 8 12 2 Z",
  list: "M4 5 L5 5 M9 5 L21 5 M4 12 L5 12 M9 12 L21 12 M4 19 L5 19 M9 19 L21 19",
  lock: "M6 10 L6 7 A6 6 0 0 1 18 7 L18 10 M4 10 L20 10 L20 22 L4 22 Z M12 15 L12 18",
  unlock:
    "M6 10 L6 7 A6 6 0 0 1 17 4 M4 10 L20 10 L20 22 L4 22 Z M12 15 L12 18",
  reset: "M3 10 A9 9 0 1 1 5 19 M3 3 L3 10 L10 10",
  grip: "M8 5 L8 6 M16 5 L16 6 M8 11 L8 12 M16 11 L16 12 M8 17 L8 18 M16 17 L16 18",
  help: "M22 12 A10 10 0 1 1 2 12 A10 10 0 1 1 22 12 M8 9 C8 4 18 6 14 11 L12 13 L12 14 M12 18 L12 18.2",
} satisfies Record<string, string>;
export type IconName = keyof typeof paths;
export default function MorphIcon({
  name,
  size = 22,
  still = false,
}: {
  name: IconName;
  size?: number;
  still?: boolean;
}) {
  const path = useRef<SVGPathElement>(null);
  const morph = useRef<Morph | null>(null);
  const initial = useRef(name);
  useEffect(() => {
    if (!path.current) return;
    morph.current = createMorph(path.current, paths[initial.current], {
      reducedMotion: "user",
    });
    return () => {
      morph.current?.destroy();
      morph.current = null;
    };
  }, []);
  useEffect(() => {
    if (!morph.current) return;
    morph.current.reducedMotion = still ? "always" : "user";
    morph.current.morphTo(paths[name], "smooth");
  }, [name, still]);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      class="morph-icon"
    >
      <path ref={path} d={paths[initial.current]} />
    </svg>
  );
}
