import { useEffect } from "preact/hooks";
import type { RefObject } from "preact";

/** Keep keyboard focus in the active dialog, including after a form step changes. */
export function useModalDialog(ref: RefObject<HTMLDialogElement>) {
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    dialog.showModal();
    function trap(event: KeyboardEvent) {
      if (event.key !== "Tab" || !dialog?.open) return;
      const targets = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          "a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]",
        ),
      ).filter((el) => el.tabIndex >= 0 && el.getClientRects().length > 0);
      const first = targets[0],
        last = targets.at(-1),
        active = document.activeElement;
      if (!first || !last) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      if (!dialog.contains(active) || active === dialog) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
      dialog.close();
      if (previous?.isConnected && !document.querySelector("dialog[open]"))
        previous.focus({ preventScroll: true });
    };
  }, []);
}
