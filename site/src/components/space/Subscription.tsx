import { useEffect, useRef, useState } from "preact/hooks";
import type { Copy, Locale } from "./copy";
import MorphIcon from "./MorphIcon";
import LetterArt from "./LetterArt";
import { reveal } from "./motion";

type Stage = "form" | "pending" | "confirmed" | "unsubscribed";
export default function Subscription({
  t,
  locale,
  gentle,
  staticSite = false,
}: {
  t: Copy;
  locale: Locale;
  gentle: boolean;
  staticSite?: boolean;
}) {
  const [email, setEmail] = useState(""),
    [consent, setConsent] = useState(false),
    [stage, setStage] = useState<Stage>("form"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<keyof Copy | null>(null),
    [attempt, setAttempt] = useState(0),
    [mode, setMode] = useState<
      "loading" | "local-preview" | "unconfigured" | "unavailable"
    >(staticSite ? "unconfigured" : "loading");
  const credentials = useRef({ confirmationToken: "", unsubscribeToken: "" }),
    formRef = useRef<HTMLDivElement>(null),
    abort = useRef<AbortController | null>(null),
    alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    if (staticSite) {
      setMode("unconfigured");
      return () => { alive.current = false; abort.current?.abort(); };
    }
    setMode("loading");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    fetch("/api/subscriptions", { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error("Unavailable");
        return r.json();
      })
      .then((data) => {
        if (alive.current)
          setMode(
            data.mode === "local-preview" ? "local-preview" : "unconfigured",
          );
      })
      .catch(() => {
        if (alive.current) setMode("unavailable");
      })
      .finally(() => clearTimeout(timeout));
    return () => {
      alive.current = false;
      clearTimeout(timeout);
      controller.abort();
      abort.current?.abort();
    };
  }, [attempt, staticSite]);
  useEffect(() => {
    if (!formRef.current) return;
    const a = reveal(formRef.current, gentle);
    return () => {
      a.cancel();
    };
  }, [stage, gentle]);
  async function send(action: "request" | "confirm" | "unsubscribe") {
    if (staticSite) { setError("liveUnavailable"); return; }
    if (busy) return;
    setError(null);
    if (action === "request") {
      if (
        !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email.trim()) ||
        email.trim().length > 254
      ) {
        setError("invalidEmail");
        return;
      }
      if (!consent) {
        setError("consentError");
        return;
      }
    }
    setBusy(true);
    const controller = new AbortController();
    abort.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    try {
      const body =
        action === "request"
          ? { email: email.trim(), consent, locale, website: "" }
          : {
              token:
                action === "confirm"
                  ? credentials.current.confirmationToken
                  : credentials.current.unsubscribeToken,
            };
      const response = await fetch(`/api/subscriptions?action=${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      const data = await response.json();
      if (!alive.current) return;
      if (!response.ok) {
        setError(
          response.status === 429
            ? "rateLimited"
            : data.error === "unconfigured"
              ? "liveUnavailable"
              : data.error === "invalid_token"
                ? "tokenError"
                : data.error === "invalid_request"
                  ? "invalidEmail"
                  : "connectionError",
        );
        return;
      }
      if (
        action === "request" &&
        data.mode === "local-preview" &&
        typeof data.confirmationToken === "string"
      ) {
        credentials.current.confirmationToken = data.confirmationToken;
        setStage("pending");
        setEmail("");
      } else if (action === "confirm" && data.status === "confirmed") {
        credentials.current.unsubscribeToken = data.unsubscribeToken;
        credentials.current.confirmationToken = "";
        setStage("confirmed");
      } else if (action === "unsubscribe" && data.status === "unsubscribed") {
        credentials.current.unsubscribeToken = "";
        setStage("unsubscribed");
      } else setError("connectionError");
    } catch {
      if (alive.current) setError("connectionError");
    } finally {
      clearTimeout(timeout);
      if (alive.current) setBusy(false);
    }
  }
  const title =
    stage === "form"
      ? t.newsletterTitle
      : stage === "pending"
        ? t.confirmationTitle
        : stage === "confirmed"
          ? t.confirmedTitle
          : t.unsubscribedTitle;
  return (
    <div class="subscription-content" ref={formRef}>
      <div class="subscription-illustration">
        <LetterArt open={stage === "pending" || stage === "confirmed"} />
      </div>
      <span class="eyebrow">{t.newsletterCaption}</span>
      <h2 id="panel-title" aria-live="polite">
        {title}
      </h2>
      <p class="panel-description">
        {stage === "form"
          ? t.subscriptionIntro
          : stage === "pending"
            ? t.confirmationBody
            : stage === "confirmed"
              ? t.confirmedBody
              : t.unsubscribedBody}
      </p>
      {stage === "form" && (
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            void send("request");
          }}
        >
          <label class="email-label" for="space-email">
            {t.email}
          </label>
          <div
            class={`email-field ${error === "invalidEmail" ? "field-invalid" : ""}`}
          >
            <MorphIcon name="mail" />
            <input
              id="space-email"
              type="email"
              name="email"
              inputMode="email"
              autoComplete="email"
              placeholder={t.emailPlaceholder}
              value={email}
              maxLength={254}
              required
              aria-invalid={error === "invalidEmail"}
              aria-describedby="subscription-notice subscription-error"
              onInput={(e) => {
                setEmail(e.currentTarget.value);
                setError(null);
              }}
              disabled={busy}
            />
          </div>
          <label class="consent-line">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => {
                setConsent(e.currentTarget.checked);
                setError(null);
              }}
              disabled={busy}
            />
            <span>{t.consent}</span>
          </label>
          <button
            type="submit"
            class="primary-button full-width"
            disabled={busy || mode !== "local-preview"}
          >
            {busy ? t.subscribing : t.subscribeSubmit}
            <MorphIcon name={busy ? "mailOpen" : "arrow"} still={gentle} />
          </button>
          <p id="subscription-notice" class="local-notice">
            <span class="status-dot" />
            {mode === "loading"
              ? t.serviceChecking
              : mode === "unavailable"
                ? t.connectionError
                : mode === "unconfigured"
                  ? t.liveUnavailable
                  : t.previewNotice}
          </p>
          {mode === "unavailable" && (
            <button
              type="button"
              class="secondary-button full-width"
              onClick={() => setAttempt((v) => v + 1)}
            >
              {t.retry}
              <MorphIcon name="reset" />
            </button>
          )}
          <p class="privacy-note">{t.privacy}</p>
        </form>
      )}
      {stage === "pending" && (
        <button
          class="primary-button full-width"
          disabled={busy}
          onClick={() => void send("confirm")}
        >
          {busy ? t.confirming : t.confirmButton}
          <MorphIcon name="check" still={gentle} />
        </button>
      )}
      {stage === "confirmed" && (
        <button
          class="secondary-button full-width"
          disabled={busy}
          onClick={() => void send("unsubscribe")}
        >
          {busy ? t.unsubscribing : t.unsubscribeButton}
          <MorphIcon name="close" still={gentle} />
        </button>
      )}
      {stage === "unsubscribed" && (
        <button
          class="secondary-button"
          onClick={() => {
            setStage("form");
            setConsent(false);
          }}
        >
          {t.returnToForm}
          <MorphIcon name="reset" />
        </button>
      )}
      <p id="subscription-error" class="form-error" role="alert">
        {error ? t[error] : ""}
      </p>
    </div>
  );
}
