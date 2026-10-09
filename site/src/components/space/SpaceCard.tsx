import { useRef, useState } from "preact/hooks";
import type { ComponentChildren } from "preact";
import MorphIcon from "./MorphIcon";
export type Position = { x: number; y: number };
export default function SpaceCard({
  id,
  children,
  className = "",
  movable,
  position,
  onMove,
  label,
  night = false,
}: {
  id: string;
  children: ComponentChildren;
  className?: string;
  movable: boolean;
  position: Position;
  onMove: (id: string, p: Position) => void;
  label: string;
  night?: boolean;
}) {
  const card = useRef<HTMLElement>(null),
    start = useRef<(Position & { px: number; py: number }) | null>(null);
  const [dragging, setDragging] = useState(false);
  function clamp(p: Position) {
    const el = card.current,
      parent = el?.parentElement;
    if (!el || !parent) return p;
    return {
      x: Math.max(
        -el.offsetLeft,
        Math.min(parent.clientWidth - el.offsetLeft - el.offsetWidth, p.x),
      ),
      y: Math.max(
        -el.offsetTop,
        Math.min(parent.clientHeight - el.offsetTop - el.offsetHeight, p.y),
      ),
    };
  }
  function stop() {
    start.current = null;
    setDragging(false);
  }
  return (
    <section
      ref={card}
      class={`space-card ${className} ${dragging ? "card-dragging" : ""}`}
      data-card={id}
      data-arrive
      style={{ "--card-x": `${position.x}px`, "--card-y": `${position.y}px` }}
      data-night={night}
    >
      <div class="card-surface">{children}</div>
      {movable && (
        <button
          class="space-drag"
          aria-label={label}
          title={label}
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            e.preventDefault();
            start.current = { ...position, px: e.clientX, py: e.clientY };
            e.currentTarget.setPointerCapture(e.pointerId);
            setDragging(true);
          }}
          onPointerMove={(e) => {
            if (start.current)
              onMove(
                id,
                clamp({
                  x: start.current.x + e.clientX - start.current.px,
                  y: start.current.y + e.clientY - start.current.py,
                }),
              );
          }}
          onPointerUp={stop}
          onPointerCancel={stop}
          onLostPointerCapture={stop}
          onKeyDown={(e) => {
            const steps: Record<string, Position> = {
              ArrowLeft: { x: -10, y: 0 },
              ArrowRight: { x: 10, y: 0 },
              ArrowUp: { x: 0, y: -10 },
              ArrowDown: { x: 0, y: 10 },
            };
            if (steps[e.key]) {
              e.preventDefault();
              onMove(
                id,
                clamp({
                  x: position.x + steps[e.key].x,
                  y: position.y + steps[e.key].y,
                }),
              );
            }
          }}
        >
          <MorphIcon name="grip" size={18} />
        </button>
      )}
    </section>
  );
}
