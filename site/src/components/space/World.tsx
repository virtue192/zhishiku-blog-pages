import { useEffect, useId, useRef } from "preact/hooks";

/** Original vector scenery: no artwork or scripts copied from reference sites. */
export function World({ variant = "desk" }: { variant?: "desk" | "intro" }) {
  const key = useId().replace(/:/g, "");
  return (
    <div class={`world-art world-${variant}`} aria-hidden="true">
      <svg viewBox="0 0 760 440" fill="none">
        <defs>
          <radialGradient id={`${key}haze`}>
            <stop stop-color="#caddeb" stop-opacity=".9" />
            <stop offset="1" stop-color="#b7d3dd" stop-opacity="0" />
          </radialGradient>
          <linearGradient
            id={`${key}ring`}
            x1="380"
            y1="70"
            x2="520"
            y2="300"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#fafafa" />
            <stop offset=".45" stop-color="#dce9ef" />
            <stop offset=".73" stop-color="#809bac" />
            <stop offset="1" stop-color="#f5f7f5" />
          </linearGradient>
          <linearGradient
            id={`${key}inside`}
            x1="370"
            y1="90"
            x2="490"
            y2="300"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#8da9b8" />
            <stop offset=".5" stop-color="#d3e3e9" />
            <stop offset="1" stop-color="#f4f5ee" />
          </linearGradient>
          <linearGradient
            id={`${key}paper`}
            x1="280"
            y1="270"
            x2="520"
            y2="350"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#fffff8" />
            <stop offset="1" stop-color="#bccbcf" />
          </linearGradient>
          <radialGradient id={`${key}pearl`} cx=".3" cy=".25" r=".8">
            <stop stop-color="#fffefa" />
            <stop offset=".5" stop-color="#dae7e5" />
            <stop offset="1" stop-color="#8ca8b4" />
          </radialGradient>
          <filter id={`${key}blur`}>
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>
        <ellipse
          cx="452"
          cy="210"
          rx="270"
          ry="210"
          fill={`url(#${key}haze)`}
        />
        <g
          class="world-orbits"
          stroke="#7796a6"
          stroke-opacity=".16"
          stroke-width=".8"
        >
          <ellipse cx="449" cy="322" rx="160" ry="40" />
          <ellipse cx="449" cy="322" rx="206" ry="57" />
          <ellipse cx="449" cy="322" rx="261" ry="77" />
          <ellipse cx="449" cy="322" rx="320" ry="104" />
          <path d="M242 322 H688 M449 225 V422" stroke-dasharray="2 7" />
        </g>
        <ellipse
          cx="460"
          cy="320"
          rx="113"
          ry="13"
          fill="#718e9a"
          opacity=".15"
          filter={`url(#${key}blur)`}
        />
        <g class="world-portal">
          <ellipse
            cx="469"
            cy="194"
            rx="123"
            ry="137"
            transform="rotate(24 469 194)"
            fill={`url(#${key}ring)`}
          />
          <ellipse
            cx="475"
            cy="191"
            rx="91"
            ry="105"
            transform="rotate(24 475 191)"
            fill={`url(#${key}inside)`}
          />
          <ellipse
            cx="472"
            cy="190"
            rx="95"
            ry="111"
            transform="rotate(24 472 190)"
            stroke="white"
            stroke-opacity=".64"
            stroke-width="1.5"
          />
          <path
            d="M429 85 C505 55 576 129 575 201"
            stroke="#fff"
            stroke-opacity=".85"
            stroke-width="3"
            stroke-linecap="round"
          />
          <path
            d="M391 233 Q458 214 544 248"
            stroke="#fafaf2"
            stroke-opacity=".7"
          />
          <path
            d="M397 253 Q451 228 534 265"
            stroke="#fafaf2"
            stroke-opacity=".4"
          />
        </g>
        <g class="world-boat">
          <path
            d="M328 287 L479 248 L550 297 L453 344 Z"
            fill={`url(#${key}paper)`}
          />
          <path d="M328 287 L445 307 L453 344 Z" fill="#e6ece8" />
          <path d="M445 307 L550 297 L453 344 Z" fill="#acbfc7" />
          <path d="M445 307 L479 248 L453 344 Z" fill="#f8faf6" />
          <path d="M328 287 L420 289 L479 248 L445 307 Z" fill="#fffef9" />
          <path
            d="M328 287 L445 307 L550 297"
            stroke="white"
            stroke-opacity=".85"
            stroke-width="1.2"
          />
        </g>
        <circle
          class="world-pearl pearl-a"
          cx="301"
          cy="170"
          r="20"
          fill={`url(#${key}pearl)`}
        />
        <circle
          class="world-pearl pearl-b"
          cx="617"
          cy="269"
          r="12"
          fill={`url(#${key}pearl)`}
        />
        <g stroke="#78909b" stroke-width="1" opacity=".55">
          <path d="M612 102 V114 M606 108 H618" />
          <path d="M319 240 V248 M315 244 H323" />
        </g>
        <circle cx="645" cy="189" r="2" fill="#8eaab4" />
        <circle cx="350" cy="100" r="2" fill="#aec2c9" />
      </svg>
    </div>
  );
}

export default function Atmosphere({
  gentle,
  night,
}: {
  gentle: boolean;
  night: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = canvas.current,
      ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    let width = innerWidth,
      height = innerHeight,
      frame = 0,
      last = 0,
      lastDrop = 0;
    let cursor = { x: -1000, y: -1000 },
      smooth = { ...cursor };
    let ripples: { x: number; y: number; born: number }[] = [];
    const dust = Array.from({ length: 28 }, (_, i) => ({
      x: (i * 0.6180339) % 1,
      y: (i * 0.381966) % 1,
      phase: i * 1.37,
    }));
    const fine = matchMedia("(pointer: fine)");
    function draw(t: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      if (gentle || !fine.matches) return;
      smooth.x += (cursor.x - smooth.x) * 0.09;
      smooth.y += (cursor.y - smooth.y) * 0.09;
      const glow = ctx.createRadialGradient(
        smooth.x,
        smooth.y,
        0,
        smooth.x,
        smooth.y,
        240,
      );
      glow.addColorStop(
        0,
        night ? "rgba(158,199,220,.07)" : "rgba(255,255,249,.6)",
      );
      glow.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);
      for (const d of dust) {
        const x = d.x * width + Math.sin(t / 11000 + d.phase) * 30;
        const y = d.y * height + Math.cos(t / 15000 + d.phase) * 22;
        ctx.fillStyle = night
          ? "rgba(215,232,238,.24)"
          : "rgba(80,114,133,.18)";
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
      ripples = ripples.filter((r) => t - r.born < 1600);
      for (const r of ripples) {
        const age = (t - r.born) / 1600;
        ctx.strokeStyle = `rgba(${night ? "210,230,241" : "107,142,161"},${(1 - age) * 0.16})`;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, 8 + age * 65, 3 + age * 23, -0.2, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    function loop(t: number) {
      if (t - last > 30) {
        draw(t);
        last = t;
      }
      frame = requestAnimationFrame(loop);
    }
    function schedule() {
      cancelAnimationFrame(frame);
      draw(performance.now());
      if (!gentle && fine.matches && !document.hidden)
        frame = requestAnimationFrame(loop);
    }
    function resize() {
      if (!el || !ctx) return;
      width = innerWidth;
      height = innerHeight;
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      el.width = width * dpr;
      el.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      schedule();
    }
    function move(e: PointerEvent) {
      cursor = { x: e.clientX, y: e.clientY };
      const t = performance.now();
      if (t - lastDrop > 115 && ripples.length < 16) {
        ripples.push({ ...cursor, born: t });
        lastDrop = t;
      }
    }
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("visibilitychange", schedule);
    fine.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("visibilitychange", schedule);
      fine.removeEventListener("change", schedule);
    };
  }, [gentle, night]);
  return (
    <div class="space-atmosphere" aria-hidden="true">
      <div class="atmosphere-wash wash-blue" />
      <div class="atmosphere-wash wash-warm" />
      <div class="atmosphere-grain" />
      <canvas ref={canvas} />
    </div>
  );
}
