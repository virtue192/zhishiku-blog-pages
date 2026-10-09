import { animate, stagger } from "animejs";

export function reveal(el: HTMLElement, gentle: boolean) {
  return animate(el, {
    opacity: [0, 1],
    y: gentle ? 0 : [20, 0],
    scale: gentle ? 1 : [0.985, 1],
    duration: gentle ? 80 : 540,
    ease: "out(4)",
  });
}
export function revealChildren(el: HTMLElement, gentle: boolean) {
  return animate(el.querySelectorAll("[data-arrive]"), {
    opacity: [0, 1],
    y: gentle ? 0 : [28, 0],
    duration: gentle ? 80 : 850,
    delay: gentle ? 0 : stagger(85),
    ease: "out(4)",
  });
}
export function press(el: HTMLElement, gentle: boolean) {
  if (gentle) return;
  return animate(el, { scale: [1, 0.95, 1], duration: 320, ease: "out(3)" });
}
export function savePreference(key: string, value: string) {
  try {
    localStorage.setItem(`ll-space-${key}`, value);
  } catch {
    /* Works without storage access. */
  }
}
export function getPreference(key: string, fallback: string) {
  try {
    return localStorage.getItem(`ll-space-${key}`) ?? fallback;
  } catch {
    return fallback;
  }
}
