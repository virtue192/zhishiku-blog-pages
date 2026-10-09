import { useEffect, useRef, useState } from "preact/hooks";
import { animate } from "animejs";
import { World } from "./World";
import MorphIcon from "./MorphIcon";
import { copy, type Locale } from "./copy";
import { reveal } from "./motion";
import { useModalDialog } from "./useModalDialog";

export default function Opening({
  locale,
  onLocale,
  gentle,
  onDone,
}: {
  locale: Locale;
  onLocale: () => void;
  gentle: boolean;
  onDone: () => void;
}) {
  const [step, setStep] = useState(0),
    [leaving, setLeaving] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null),
    words = useRef<HTMLDivElement>(null);
  const t = copy[locale];
  useModalDialog(dialog);
  useEffect(() => {
    if (!words.current) return;
    const a = reveal(words.current, gentle);
    return () => {
      a.cancel();
    };
  }, [step, gentle]);
  function finish() {
    if (leaving) return;
    setLeaving(true);
    const el = dialog.current;
    if (!el) {
      onDone();
      return;
    }
    animate(el, {
      opacity: [1, 0],
      scale: gentle ? 1 : [1, 1.035],
      duration: gentle ? 80 : 650,
      ease: "inOut(3)",
      onComplete: () => {
        el.close();
        onDone();
      },
    });
  }
  return (
    <dialog
      ref={dialog}
      class="opening"
      aria-labelledby="opening-title"
      onCancel={(e) => {
        e.preventDefault();
        finish();
      }}
      data-step={step}
    >
      <div class="opening-top">
        <span class="wordmark">
          <MorphIcon name="spark" /> LIFE LEDGER
        </span>
        <div>
          <button
            class="text-control"
            onClick={onLocale}
            aria-label={t.language}
          >
            {locale === "zh" ? "EN" : "中文"}
          </button>
          <button class="text-control" onClick={finish}>
            {t.skip}
            <MorphIcon name="northeast" size={16} />
          </button>
        </div>
      </div>
      <div class="opening-landscape">
        <World variant="intro" />
        <div class="opening-horizon" />
        <span class="opening-coordinate">00{step + 1} / 003</span>
      </div>
      <div class="opening-words" ref={words}>
        <p class="eyebrow">{t.introEyebrow}</p>
        <h1 id="opening-title">
          {[t.introOne, t.introTwo, t.introThree][step]}
        </h1>
        <p>{[t.introOneSub, t.introTwoSub, t.introThreeSub][step]}</p>
      </div>
      <div class="opening-bottom">
        <div class="chapter-dots">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              aria-label={`${i + 1} / 3`}
              aria-current={step === i ? "step" : undefined}
              onClick={() => setStep(i)}
            >
              <span />
            </button>
          ))}
        </div>
        <button
          class="primary-button"
          disabled={leaving}
          onClick={() => (step < 2 ? setStep(step + 1) : finish())}
        >
          {step < 2 ? t.next : t.enter}
          <MorphIcon name={step === 2 ? "northeast" : "arrow"} />
        </button>
        <span class="opening-bottom-note">{t.welcomeHint}</span>
      </div>
    </dialog>
  );
}
