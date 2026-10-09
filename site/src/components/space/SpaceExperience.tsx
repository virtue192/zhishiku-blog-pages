import { useEffect, useRef, useState } from "preact/hooks";
import type { ComponentChildren } from "preact";
import { animate } from "animejs";
import { copy, readSpace, type Copy, type Locale, type Panel } from "./copy";
import MorphIcon, { type IconName } from "./MorphIcon";
import Atmosphere, { World } from "./World";
import SpaceCard, { type Position } from "./SpaceCard";
import LetterArt from "./LetterArt";
import Opening from "./Opening";
import Subscription from "./Subscription";
import { useModalDialog } from "./useModalDialog";
import {
  getPreference,
  press,
  reveal,
  revealChildren,
  savePreference,
} from "./motion";

const navigation: { panel: Panel; key: keyof Copy; icon: IconName }[] = [
  { panel: null, key: "home", icon: "home" },
  { panel: "library", key: "library", icon: "book" },
  { panel: "projects", key: "projects", icon: "grid" },
  { panel: "about", key: "about", icon: "compass" },
  { panel: "subscribe", key: "subscribe", icon: "mail" },
];
const cardIds = [
  "world",
  "shelf",
  "clock",
  "projects",
  "about",
  "letter",
  "sound",
];
function EmptyArt({
  variant = "books",
}: {
  variant?: "books" | "folders" | "orbit";
}) {
  return (
    <div class={`empty-art empty-art-${variant}`} aria-hidden="true">
      {variant === "books" ? (
        <>
          <i />
          <i />
          <i />
          <i />
          <i />
        </>
      ) : variant === "folders" ? (
        <>
          <i />
          <i />
          <i />
        </>
      ) : (
        <>
          <i />
          <i />
          <span>✳</span>
        </>
      )}
    </div>
  );
}
function IconButton({
  icon,
  label,
  onClick,
  active = false,
  gentle = false,
  children,
}: {
  icon: IconName;
  label: string;
  onClick: () => void;
  active?: boolean;
  gentle?: boolean;
  children?: ComponentChildren;
}) {
  return (
    <button
      class={`icon-button ${active ? "is-active" : ""}`}
      aria-label={label}
      data-tip={label}
      onClick={onClick}
      aria-pressed={active}
    >
      <MorphIcon name={icon} still={gentle} />
      {children}
    </button>
  );
}

function Modal({
  panel,
  t,
  gentle,
  onClose,
  locale,
  onLocale,
  children,
}: {
  panel: Panel;
  t: Copy;
  gentle: boolean;
  onClose: () => void;
  locale: Locale;
  onLocale: () => void;
  children: ComponentChildren;
}) {
  const ref = useRef<HTMLDialogElement>(null),
    surface = useRef<HTMLDivElement>(null),
    closing = useRef(false);
  useModalDialog(ref);
  useEffect(() => {
    if (!surface.current) return;
    const a = reveal(surface.current, gentle);
    return () => {
      a.cancel();
    };
  }, [panel, gentle]);
  function close() {
    if (closing.current) return;
    closing.current = true;
    const el = surface.current;
    if (!el) {
      onClose();
      return;
    }
    animate(el, {
      opacity: [1, 0],
      y: gentle ? 0 : [0, 12],
      duration: gentle ? 60 : 200,
      ease: "in(2)",
      onComplete: () => {
        ref.current?.close();
        onClose();
      },
    });
  }
  return (
    <dialog
      ref={ref}
      class={`space-dialog panel-${panel}`}
      aria-labelledby="panel-title"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div class="panel-surface" ref={surface}>
        <div class="panel-toolbar">
          <span class="panel-wordmark">
            <MorphIcon name="spark" size={17} /> LIFE LEDGER
          </span>
          <div class="panel-controls">
            <button
              class="language-control"
              aria-label={t.language}
              onClick={onLocale}
            >
              <span class={locale === "zh" ? "current" : ""}>中</span>
              <i />
              <span class={locale === "en" ? "current" : ""}>EN</span>
            </button>
            <IconButton
              icon="close"
              label={t.close}
              onClick={close}
              gentle={gentle}
            />
          </div>
        </div>
        {children}
        <div class="panel-bottom">
          <span>{t.contentLabel}</span>
          <span>{t.keyboardHint}</span>
        </div>
      </div>
    </dialog>
  );
}

export default function SpaceExperience({
  siteBase = "/",
  staticSite = false,
}: { siteBase?: string; staticSite?: boolean } = {}) {
  const [locale, setLocale] = useState<Locale>("zh"),
    [night, setNight] = useState(false),
    [motion, setMotion] = useState(true),
    [reduced, setReduced] = useState(false),
    [loaded, setLoaded] = useState(false);
  const [panel, setPanel] = useState<Panel>(null),
    [intro, setIntro] = useState(false),
    [movable, setMovable] = useState(false),
    [positions, setPositions] = useState<Record<string, Position>>({});
  const [now, setNow] = useState<Date | null>(null),
    [query, setQuery] = useState(""),
    [selection, setSelection] = useState(0),
    [layout, setLayout] = useState<"grid" | "list">("grid"),
    [category, setCategory] = useState("all"),
    [tour, setTour] = useState(0),
    [toast, setToast] = useState<keyof Copy | null>(null);
  const [playing, setPlaying] = useState(false),
    [volume, setVolume] = useState(0.45);
  const root = useRef<HTMLDivElement>(null),
    board = useRef<HTMLDivElement>(null),
    audio = useRef<AudioContext | null>(null),
    gain = useRef<GainNode | null>(null),
    searchRef = useRef<HTMLInputElement>(null);
  const gentle = reduced || !motion,
    t = copy[locale];
  function navigate(next: Panel, replace = false) {
    const url = new URL(location.href);
    next
      ? url.searchParams.set("space", next)
      : url.searchParams.delete("space");
    if (url.href !== location.href)
      history[replace ? "replaceState" : "pushState"]({}, "", url);
    setPanel(next);
    setQuery("");
    setSelection(0);
    setCategory("all");
    setTour(0);
  }
  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const fullMotion = getPreference("motion", "on") !== "off";
    setMotion(fullMotion);
    setNight(getPreference("night", "false") === "true");
    setLocale(getPreference("locale", "zh") === "en" ? "en" : "zh");
    const savedVolume = Number(getPreference("volume", "0.45"));
    if (Number.isFinite(savedVolume))
      setVolume(Math.min(1, Math.max(0, savedVolume)));
    try {
      const saved = JSON.parse(getPreference("positions", "{}"));
      const valid: Record<string, Position> = {};
      for (const id of cardIds) {
        const p = saved?.[id];
        if (
          p &&
          Number.isFinite(p.x) &&
          Number.isFinite(p.y) &&
          Math.abs(p.x) < 1000 &&
          Math.abs(p.y) < 1000
        )
          valid[id] = p;
      }
      setPositions(valid);
    } catch {}
    const current = readSpace(location.search);
    setPanel(current);
    setIntro(
      !current &&
        !mq.matches &&
        fullMotion &&
        getPreference("visited", "false") !== "true",
    );
    setNow(new Date());
    setLoaded(true);
    const clock = window.setInterval(() => {
      if (!document.hidden) setNow(new Date());
    }, 1000);
    function pop() {
      setPanel(readSpace(location.search));
      setIntro(false);
      setQuery("");
      setCategory("all");
    }
    function key(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIntro(false);
        navigate("search");
      }
    }
    function preference() {
      setReduced(mq.matches);
      if (mq.matches) setIntro(false);
    }
    function visibility() {
      if (document.hidden) {
        void audio.current?.suspend();
        setPlaying(false);
      } else setNow(new Date());
    }
    mq.addEventListener("change", preference);
    window.addEventListener("popstate", pop);
    window.addEventListener("keydown", key);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      clearInterval(clock);
      mq.removeEventListener("change", preference);
      window.removeEventListener("popstate", pop);
      window.removeEventListener("keydown", key);
      document.removeEventListener("visibilitychange", visibility);
      void audio.current?.close();
    };
  }, []);
  useEffect(() => {
    if (!loaded) return;
    savePreference("locale", locale);
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
    document.title =
      locale === "zh"
        ? "慢慢 · Life Ledger — 个人空间"
        : "Virtu · Life Ledger — Personal Space";
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", t.subtitle);
  }, [locale, loaded]);
  useEffect(() => {
    if (!loaded) return;
    savePreference("night", String(night));
    document.documentElement.style.colorScheme = night ? "dark" : "light";
    savePreference("motion", motion ? "on" : "off");
  }, [night, motion, loaded]);
  useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(
      () => savePreference("positions", JSON.stringify(positions)),
      150,
    );
    return () => clearTimeout(timer);
  }, [positions, loaded]);
  useEffect(() => {
    if (!loaded || intro || !board.current) return;
    const a = revealChildren(board.current, gentle);
    return () => {
      a.cancel();
    };
  }, [loaded, intro]);
  useEffect(() => {
    if (panel === "search") {
      const id = setTimeout(() => searchRef.current?.focus(), 80);
      return () => clearTimeout(id);
    }
  }, [panel]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(id);
  }, [toast]);
  useEffect(() => {
    if (loaded) savePreference("volume", String(volume));
    gain.current?.gain.setTargetAtTime(
      volume * 0.025,
      audio.current?.currentTime || 0,
      0.15,
    );
  }, [volume, loaded]);
  async function toggleSound() {
    try {
      if (playing) {
        await audio.current?.suspend();
        setPlaying(false);
        return;
      }
      if (!audio.current) {
        const context = new AudioContext();
        audio.current = context;
        const out = context.createGain();
        out.gain.value = volume * 0.025;
        gain.current = out;
        out.connect(context.destination);
        [174.61, 261.63, 349.23].forEach((frequency, i) => {
          const oscillator = context.createOscillator();
          oscillator.type = "sine";
          oscillator.frequency.value = frequency;
          oscillator.detune.value = i * 2;
          oscillator.connect(out);
          oscillator.start();
        });
      }
      await audio.current.resume();
      setPlaying(true);
    } catch {
      setToast("audioUnavailable");
    }
  }
  function finishIntro() {
    setIntro(false);
    savePreference("visited", "true");
    requestAnimationFrame(() =>
      document.querySelector<HTMLButtonElement>(".rail-home")?.focus(),
    );
  }
  function card(id: string, extra: string, children: ComponentChildren) {
    return (
      <SpaceCard
        id={id}
        className={extra}
        movable={movable}
        position={positions[id] || { x: 0, y: 0 }}
        onMove={(key, value) => setPositions((p) => ({ ...p, [key]: value }))}
        label={t.drag}
        night={night}
      >
        {children}
      </SpaceCard>
    );
  }
  const commands = navigation.filter(
    (item) =>
      !query ||
      [copy.en[item.key], copy.zh[item.key]].some((v) =>
        v.toLowerCase().includes(query.trim().toLowerCase()),
      ),
  );
  const time = now
    ? new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(now)
    : "--:--";
  const date = now
    ? new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-GB", {
        month: "short",
        day: "numeric",
        weekday: "short",
      }).format(now)
    : "—";

  return (
    <div
      ref={root}
      class={`space-app ${gentle ? "gentle-mode" : ""} ${movable ? "layout-unlocked" : ""}`}
      data-theme={night ? "night" : "day"}
      data-locale={locale}
      data-ready={loaded}
      onClick={(e) => {
        const button = (e.target as Element).closest<HTMLButtonElement>(
          "button",
        );
        if (button && !button.disabled) press(button, gentle);
      }}
      onPointerMove={(e) => {
        if (gentle || e.pointerType === "touch") return;
        const rect = root.current?.getBoundingClientRect();
        if (rect) {
          root.current?.style.setProperty(
            "--pointer-x",
            String((e.clientX - rect.width / 2) / rect.width),
          );
          root.current?.style.setProperty(
            "--pointer-y",
            String((e.clientY - innerHeight / 2) / innerHeight),
          );
        }
      }}
    >
      <Atmosphere gentle={gentle} night={night} />
      <a class="space-skip" href="#space-main">
        {t.home}
      </a>
      <header class="space-header">
        <a
          class="space-brand"
          href={siteBase}
          onClick={(e) => {
            if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
            e.preventDefault();
            navigate(null);
          }}
          aria-label={t.home}
        >
          <span class="brand-symbol">
            <MorphIcon name="spark" size={27} />
          </span>
          <span>
            LIFE LEDGER<small>{t.space} / VIRTU</small>
          </span>
        </a>
        <div class="header-center">
          <span class="status-dot" />
          {t.edition}
        </div>
        <div class="header-controls">
          <button
            class="language-control"
            onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
            aria-label={t.language}
          >
            <span class={locale === "zh" ? "current" : ""}>中</span>
            <i />
            <span class={locale === "en" ? "current" : ""}>EN</span>
          </button>
          <span class="control-divider" />
          <IconButton
            icon={playing ? "volume" : "muted"}
            label={playing ? t.soundOff : t.soundOn}
            onClick={() => void toggleSound()}
            active={playing}
            gentle={gentle}
          />
          <IconButton
            icon="help"
            label={t.guide}
            onClick={() => navigate("guide")}
            gentle={gentle}
          />
        </div>
      </header>
      <main id="space-main" class="space-main">
        <div class="space-heading">
          <div>
            <p class="eyebrow">
              <span class="tiny-cross">+</span> {t.space}{" "}
              <span class="heading-index">/ 001</span>
            </p>
            <h1>
              {t.title}
              <span class="heading-spark" aria-hidden="true">
                ✳
              </span>
            </h1>
            <p class="heading-subtitle">{t.subtitle}</p>
          </div>
          <button
            class="search-capsule"
            onClick={() => navigate("search")}
            aria-label={t.search}
          >
            <MorphIcon name="search" size={18} />
            <span>{t.search}</span>
            <kbd>⌘ K</kbd>
          </button>
        </div>
        <div class="workspace-layout">
          <aside class="space-rail">
            <nav aria-label={t.space}>
              {navigation.map((item) => (
                <button
                  key={item.key}
                  class={`rail-button ${item.panel === panel ? "is-current" : ""} ${item.panel === null ? "rail-home" : ""}`}
                  aria-label={t[item.key]}
                  data-tip={t[item.key]}
                  aria-current={item.panel === panel ? "page" : undefined}
                  onClick={() => navigate(item.panel)}
                >
                  <MorphIcon name={item.icon} still={gentle} />
                  <span class="rail-active-dot" />
                </button>
              ))}
            </nav>
            <div class="rail-bottom">
              <span class="rail-divider" />
              <IconButton
                icon="settings"
                label={t.preferences}
                onClick={() => navigate("preferences")}
                gentle={gentle}
              />
            </div>
          </aside>
          <div class="space-board" ref={board}>
            {card(
              "world",
              "world-card",
              <>
                <div class="world-card-top">
                  <span class="eyebrow">01 / {t.sceneEyebrow}</span>
                  <span class="world-live" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                </div>
                <World />
                <div class="world-card-bottom">
                  <div>
                    <h2>{t.sceneTitle}</h2>
                    <p>{t.sceneHint}</p>
                  </div>
                  <button
                    class="circle-arrow"
                    aria-label={t.sceneAction}
                    data-tip={t.sceneAction}
                    onClick={() => {
                      navigate(null);
                      setIntro(true);
                    }}
                  >
                    <MorphIcon name="northeast" size={23} still={gentle} />
                  </button>
                </div>
                <span class="world-coordinate" aria-hidden="true">
                  N 00° 00′ &nbsp; E ∞
                </span>
              </>,
            )}
            {card(
              "shelf",
              "shelf-card",
              <button
                class="whole-card"
                onClick={() => navigate("library")}
                aria-label={t.library}
              >
                <span class="card-topline">
                  <span class="eyebrow">{t.shelfCaption}</span>
                  <MorphIcon name="northeast" size={16} />
                </span>
                <EmptyArt />
                <span class="tile-title">{t.shelfTitle}</span>
                <span class="tile-meta">
                  {t.shelfMeta}
                  <span class="count-pill">00</span>
                </span>
              </button>,
            )}
            {card(
              "clock",
              "clock-card",
              <>
                <span class="eyebrow">{t.timeCaption}</span>
                <div class="clock-face">
                  <div class="clock-ticks" />
                  {Array.from({ length: 12 }, (_, i) => (
                    <i
                      class="clock-mark"
                      style={{ rotate: `${i * 30}deg` }}
                      key={i}
                    />
                  ))}
                  <span
                    class="clock-hand hour-hand"
                    style={{
                      rotate: `${now ? (now.getHours() % 12) * 30 + now.getMinutes() * 0.5 : 0}deg`,
                    }}
                  />
                  <span
                    class="clock-hand minute-hand"
                    style={{ rotate: `${now ? now.getMinutes() * 6 : 0}deg` }}
                  />
                  <b />
                </div>
                <time class="clock-digital">{time}</time>
                <span class="clock-date">{date}</span>
              </>,
            )}
            {card(
              "projects",
              "projects-card",
              <button
                class="whole-card"
                onClick={() => navigate("projects")}
                aria-label={t.projects}
              >
                <span class="card-topline">
                  <span class="eyebrow">{t.projectCaption}</span>
                  <MorphIcon name="northeast" size={16} />
                </span>
                <div class="project-row">
                  <div>
                    <span class="tile-title">{t.projectTitle}</span>
                    <span class="tile-meta">{t.projectMeta}</span>
                  </div>
                  <EmptyArt variant="folders" />
                </div>
              </button>,
            )}
            {card(
              "about",
              "about-card",
              <button
                class="whole-card"
                onClick={() => navigate("about")}
                aria-label={t.about}
              >
                <span class="eyebrow">{t.aboutCaption}</span>
                <span class="tile-title">{t.aboutTitle}</span>
                <span class="tile-meta">
                  {t.aboutAction}
                  <MorphIcon name="arrow" size={17} />
                </span>
                <EmptyArt variant="orbit" />
              </button>,
            )}
            {card(
              "letter",
              "newsletter-card",
              <button
                class="whole-card"
                onClick={() => navigate("subscribe")}
                aria-label={t.newsletterAction}
              >
                <span class="eyebrow">{t.newsletterCaption}</span>
                <span class="tile-title">{t.newsletterTitle}</span>
                <span class="letter-card-action">
                  {t.newsletterAction}
                  <MorphIcon name="arrow" size={16} />
                </span>
                <LetterArt />
                <span class="preview-badge">{staticSite ? t.deliveryPending : t.previewBadge}</span>
              </button>,
            )}
            {card(
              "sound",
              "sound-card",
              <>
                <div class="card-topline">
                  <span class="eyebrow">{t.atmosphere}</span>
                  <span class={`audio-dot ${playing ? "playing" : ""}`} />
                </div>
                <div
                  class={`sound-wave ${playing ? "is-playing" : ""}`}
                  aria-hidden="true"
                >
                  {Array.from({ length: 22 }, (_, i) => (
                    <i
                      key={i}
                      style={{
                        "--bar": `${12 + Math.sin(i * 0.74) * 9 + Math.cos(i * 0.41) * 8}px`,
                        "--delay": `${i * -0.09}s`,
                      }}
                    />
                  ))}
                </div>
                <div class="sound-bottom">
                  <div>
                    <h2>{t.atmosphereTitle}</h2>
                    <span>{t.timeZone}</span>
                  </div>
                  <button
                    class="sound-play"
                    aria-label={playing ? t.soundOff : t.soundOn}
                    aria-pressed={playing}
                    onClick={() => void toggleSound()}
                  >
                    <MorphIcon
                      name={playing ? "pause" : "play"}
                      size={19}
                      still={gentle}
                    />
                  </button>
                </div>
              </>,
            )}
          </div>
        </div>
        <footer class="space-footer">
          <span>
            <span class="tiny-cross">+</span> {t.footer}
          </span>
          <div>
            <button
              onClick={() => {
                navigate(null);
                setIntro(true);
              }}
              aria-label={t.replay}
            >
              <MorphIcon name="reset" size={14} />
              {t.replay}
            </button>
            <span class="footer-separator">/</span>
            <span>{t.footerRight}</span>
          </div>
          <button
            class="footer-settings"
            aria-label={t.preferences}
            onClick={() => navigate("preferences")}
          >
            <MorphIcon name="settings" size={18} />
          </button>
        </footer>
      </main>
      {toast && (
        <div class="space-toast" role="status">
          <MorphIcon name="check" size={16} />
          {t[toast]}
        </div>
      )}
      {intro && (
        <Opening
          locale={locale}
          onLocale={() => setLocale(locale === "zh" ? "en" : "zh")}
          gentle={gentle}
          onDone={finishIntro}
        />
      )}
      {panel && (
        <Modal
          panel={panel}
          t={t}
          gentle={gentle}
          onClose={() => navigate(null)}
          locale={locale}
          onLocale={() => setLocale(locale === "zh" ? "en" : "zh")}
        >
          {panel === "subscribe" ? (
            <Subscription t={t} locale={locale} gentle={gentle} staticSite={staticSite} />
          ) : panel === "search" ? (
            <div class="search-panel">
              <h2 id="panel-title">{t.search}</h2>
              <div class="search-input-wrap">
                <MorphIcon name="search" />
                <input
                  ref={searchRef}
                  value={query}
                  placeholder={t.searchHint}
                  aria-label={t.search}
                  role="combobox"
                  aria-autocomplete="list"
                  aria-expanded="true"
                  aria-controls="space-results"
                  aria-activedescendant={
                    commands.length
                      ? `command-${Math.min(selection, commands.length - 1)}`
                      : undefined
                  }
                  onInput={(e) => {
                    setQuery(e.currentTarget.value);
                    setSelection(0);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setSelection((v) =>
                        Math.max(0, Math.min(v + 1, commands.length - 1)),
                      );
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setSelection((v) => Math.max(v - 1, 0));
                    } else if (e.key === "Enter" && commands[selection]) {
                      e.preventDefault();
                      navigate(commands[selection].panel);
                    }
                  }}
                />
              </div>
              <p class="search-help">{t.navigationOnly}</p>
              <div id="space-results" role="listbox" aria-label={t.space}>
                {commands.map((item, i) => (
                  <button
                    id={`command-${i}`}
                    key={item.key}
                    class={`command-result ${selection === i ? "selected" : ""}`}
                    role="option"
                    aria-selected={selection === i}
                    onMouseEnter={() => setSelection(i)}
                    onClick={() => navigate(item.panel)}
                  >
                    <MorphIcon name={item.icon} />
                    <span>{t[item.key]}</span>
                    <MorphIcon name="arrow" size={17} />
                  </button>
                ))}
                {!commands.length && <p class="no-results">{t.noResults}</p>}
              </div>
            </div>
          ) : panel === "preferences" ? (
            <div class="preferences-panel">
              <span class="eyebrow">LIFE LEDGER / {t.space}</span>
              <h2 id="panel-title">{t.preferences}</h2>
              <div class="preference-row">
                <span>
                  <MorphIcon name={night ? "moon" : "sun"} still={gentle} />
                  {t.theme}
                </span>
                <button
                  class="pill-switch"
                  onClick={() => setNight((v) => !v)}
                  aria-label={t.theme}
                  aria-pressed={night}
                >
                  {night ? t.night : t.day}
                  <MorphIcon
                    name={night ? "moon" : "sun"}
                    size={18}
                    still={gentle}
                  />
                </button>
              </div>
              <div class="preference-row">
                <span>
                  <MorphIcon name={gentle ? "pause" : "play"} still={gentle} />
                  {t.motion}
                </span>
                <button
                  class="pill-switch"
                  onClick={() => setMotion((v) => !v)}
                  aria-label={t.motion}
                  aria-pressed={!gentle}
                  disabled={reduced}
                >
                  {gentle ? t.motionOff : t.motionOn}
                </button>
              </div>
              {reduced && <p class="preference-help">{t.motionSystem}</p>}
              <div class="preference-row rearrange-preference">
                <span>
                  <MorphIcon
                    name={movable ? "unlock" : "lock"}
                    still={gentle}
                  />
                  {t.rearrange}
                </span>
                <button
                  class="pill-switch"
                  onClick={() => setMovable((v) => !v)}
                  aria-label={t.rearrange}
                  aria-pressed={movable}
                >
                  {movable ? t.unlocked : t.locked}
                </button>
              </div>
              <div class="preference-row">
                <span>
                  <MorphIcon
                    name={playing ? "volume" : "muted"}
                    still={gentle}
                  />
                  {t.atmosphereTitle}
                </span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step=".05"
                  value={volume}
                  aria-label={t.atmosphereTitle}
                  onInput={(e) => setVolume(Number(e.currentTarget.value))}
                />
              </div>
              <button
                class="secondary-button full-width"
                onClick={() => {
                  setPositions({});
                  setToast("resetDone");
                }}
              >
                <MorphIcon name="reset" size={17} />
                {t.reset}
              </button>
              <p class="preference-help">{t.preferencesNote}</p>
            </div>
          ) : panel === "guide" ? (
            <div class="guide-panel">
              <div class={`tour-visual tour-step-${tour}`} aria-hidden="true">
                <span class="tour-path" />
                {["compass", "grid", "mailOpen"].map((name, i) => (
                  <span
                    class={`tour-stop ${tour === i ? "active" : ""}`}
                    key={name}
                  >
                    <MorphIcon name={name as IconName} size={35} />
                  </span>
                ))}
              </div>
              <span class="eyebrow">0{tour + 1} / 03</span>
              <h2 id="panel-title">
                {[t.tourOne, t.tourTwo, t.tourThree][tour]}
              </h2>
              <p class="panel-description">
                {[t.tourOneBody, t.tourTwoBody, t.tourThreeBody][tour]}
              </p>
              <div class="tour-actions">
                <button
                  class="icon-button"
                  disabled={tour === 0}
                  aria-label={t.back}
                  onClick={() => setTour((v) => v - 1)}
                >
                  <MorphIcon name="back" />
                </button>
                <div class="tour-progress" aria-hidden="true">
                  {[0, 1, 2].map((i) => (
                    <i class={tour === i ? "active" : ""} key={i} />
                  ))}
                </div>
                <button
                  class="primary-button"
                  onClick={() =>
                    tour < 2 ? setTour((v) => v + 1) : navigate(null)
                  }
                >
                  {tour === 2 ? t.tourDone : t.next}
                  <MorphIcon
                    name={tour === 2 ? "check" : "arrow"}
                    still={gentle}
                  />
                </button>
              </div>
            </div>
          ) : (
            <div class="collection-panel">
              <span class="eyebrow">
                {panel === "library"
                  ? t.shelfCaption
                  : panel === "projects"
                    ? t.projectCaption
                    : t.aboutCaption}
              </span>
              <h2 id="panel-title">{t[panel]}</h2>
              {panel !== "about" && (
                <div class="collection-tools">
                  <div class="collection-filters">
                    {(panel === "library"
                      ? ["all", "notes", "reads"]
                      : ["all", "experiments"]
                    ).map((key) => (
                      <button
                        key={key}
                        class={category === key ? "selected" : ""}
                        aria-pressed={category === key}
                        onClick={() => setCategory(key)}
                      >
                        {t[key as keyof Copy]}
                      </button>
                    ))}
                  </div>
                  <button
                    class="icon-button"
                    aria-label={layout === "grid" ? t.list : t.grid}
                    onClick={() =>
                      setLayout((v) => (v === "grid" ? "list" : "grid"))
                    }
                  >
                    <MorphIcon
                      name={layout === "grid" ? "list" : "grid"}
                      still={gentle}
                    />
                  </button>
                </div>
              )}
              <div
                class={`collection-empty view-${layout}`}
                key={`${panel}-${category}`}
              >
                <EmptyArt
                  variant={
                    panel === "library"
                      ? "books"
                      : panel === "projects"
                        ? "folders"
                        : "orbit"
                  }
                />
                <h3>{t.emptyTitle}</h3>
                <p>
                  {panel === "library"
                    ? t.emptyBody
                    : panel === "projects"
                      ? t.emptyProjects
                      : t.emptyAbout}
                </p>
                {panel !== "about" && (
                  <span class="empty-count">
                    {t[category as keyof Copy]} · {t.collectionCount}
                  </span>
                )}
              </div>
              <button class="secondary-button" onClick={() => navigate(null)}>
                {t.returnHome}
                <MorphIcon name="arrow" size={18} />
              </button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
