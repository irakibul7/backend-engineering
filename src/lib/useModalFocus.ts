import { useEffect, useRef } from "react";

const focusableSelector = 'a[href], button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])';

/** Keep the background inert and return focus to the opener on dismissal. */
export function useModalFocus(returnFocus: HTMLElement | null) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const opener = returnFocus ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    const layer = dialog.parentElement;
    const siblings = [...(layer?.parentElement?.children ?? [])]
      .filter((element): element is HTMLElement => element instanceof HTMLElement && element !== layer);
    const previousInert = siblings.map((element) => element.inert);
    siblings.forEach((element) => { element.inert = true; });
    const controls = () => [...dialog.querySelectorAll<HTMLElement>("*")]
      .filter((element) => element.matches(focusableSelector) && !element.closest('[hidden], [inert]'));
    const focusInitial = () => (dialog.querySelector<HTMLElement>('[data-modal-initial]') ?? controls()[0] ?? dialog).focus({ preventScroll: true });
    focusInitial();
    const containFocus = (event: FocusEvent) => {
      if (event.target instanceof Node && !dialog.contains(event.target)) focusInitial();
    };
    const trapTab = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = controls();
      const first = items[0];
      const last = items.at(-1);
      if (!first) { event.preventDefault(); dialog.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener("keydown", trapTab);
    document.addEventListener("focusin", containFocus);
    return () => {
      document.removeEventListener("keydown", trapTab);
      document.removeEventListener("focusin", containFocus);
      siblings.forEach((element, index) => { element.inert = previousInert[index]; });
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [returnFocus]);
  return ref;
}
