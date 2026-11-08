import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(',');
const DIALOG_SELECTOR = '[role="dialog"][aria-modal="true"]';
const DIALOG_STACK_CHANGE_EVENT = 'imperium-dialog-stack-change';

interface AccessibleDialogOptions {
  closeOnEscape?: boolean;
}

function getDialogLayer(dialog: HTMLElement): HTMLElement {
  const style = window.getComputedStyle(dialog);
  if (style.position === 'fixed' && style.zIndex !== 'auto') return dialog;
  return dialog.parentElement ?? dialog;
}

function getTopmostDialog(): HTMLElement | null {
  const dialogs = Array.from(
    document.querySelectorAll<HTMLElement>(DIALOG_SELECTOR)
  ).filter((dialog) => {
    const layer = getDialogLayer(dialog);
    const style = window.getComputedStyle(layer);
    return (
      style.visibility !== 'hidden' &&
      style.display !== 'none' &&
      dialog.getClientRects().length > 0
    );
  });

  dialogs.sort((a, b) => {
    const layerA = getDialogLayer(a);
    const layerB = getDialogLayer(b);
    const zA = Number.parseInt(window.getComputedStyle(layerA).zIndex, 10) || 0;
    const zB = Number.parseInt(window.getComputedStyle(layerB).zIndex, 10) || 0;
    if (zA !== zB) return zA - zB;

    const position = layerA.compareDocumentPosition(layerB);
    if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
    if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
    return 0;
  });

  return dialogs.at(-1) ?? null;
}

export function useAccessibleDialog(
  isOpen: boolean,
  onClose: () => void,
  options: AccessibleDialogOptions = {}
) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const closeOnEscape = options.closeOnEscape ?? true;

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const getFocusableElements = () =>
      Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (element) =>
          !element.hasAttribute('disabled') &&
          element.getAttribute('aria-hidden') !== 'true' &&
          element.tabIndex >= 0 &&
          element.getClientRects().length > 0
      );
    const focusFirst = () => {
      const items = getFocusableElements();
      (items[0] ?? dialog).focus();
    };

    if (getTopmostDialog() === dialog) focusFirst();

    const handleStackChange = () => {
      if (
        getTopmostDialog() === dialog &&
        !dialog.contains(document.activeElement)
      ) {
        focusFirst();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (getTopmostDialog() !== dialog) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        if (closeOnEscape) onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab') return;
      const items = getFocusableElements();
      if (items.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !dialog.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (active === last || !dialog.contains(active))
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener(DIALOG_STACK_CHANGE_EVENT, handleStackChange);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener(DIALOG_STACK_CHANGE_EVENT, handleStackChange);
      if (previousFocus?.isConnected) previousFocus.focus();
      document.dispatchEvent(new Event(DIALOG_STACK_CHANGE_EVENT));
    };
  }, [closeOnEscape, isOpen]);

  return dialogRef;
}
