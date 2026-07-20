import { useEffect, useRef, type ReactNode } from 'react';
import './BottomSheet.css';

export interface BottomSheetProps {
  /** Whether the sheet is mounted + risen. */
  open: boolean;
  /** Close without a result (scrim tap, grabber tap, Escape, swipe-down). */
  onClose: () => void;
  /** Accessible name for the dialog. */
  ariaLabel: string;
  /**
   * Content rendered INSIDE the draggable handle zone, under the grabber —
   * a title/summary that also dismisses on a downward swipe. Optional.
   */
  handleContent?: ReactNode;
  /** The sheet body. */
  children: ReactNode;
}

/** px the sheet must be pulled down before release dismisses it. */
const DISMISS_AFTER = 90;

/**
 * A bottom sheet — scrim + risen card, dismissible by scrim tap, grabber tap,
 * Escape, or a downward swipe on the handle. Extracted from the 2.5 month-sheet
 * so every sheet (picker, breakdown, …) shares one proven, accessible shell and
 * the swipe logic lives in exactly one place.
 *
 * Presentational: all content arrives via `handleContent` (in the drag zone) and
 * `children` (the body). The panel aligns to the app column, not the full
 * desktop viewport, and pads for the safe-area inset.
 *
 * Focus: on open, focus moves to the first `[data-focus="true"]` descendant if
 * present, else the panel; on close, focus is restored to the opener.
 */
export function BottomSheet({ open, onClose, ariaLabel, handleContent, children }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  // Live-drag offset + active flag, written imperatively so a finger-follow drag
  // doesn't thrash React state on every pointer move.
  const panelRef = useRef<HTMLDivElement>(null);

  // Freeze the background scroll while the sheet is open (correct modal behavior;
  // also stops the content under the scrim from repainting/flashing).
  useEffect(() => {
    if (!open) return;
    document.body.classList.add('vt-sheet-open');
    return () => document.body.classList.remove('vt-sheet-open');
  }, [open]);

  // Focus management + Escape-to-close, only while open.
  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const focusTarget =
      sheetRef.current?.querySelector<HTMLElement>('[data-focus="true"]') ?? sheetRef.current;
    focusTarget?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      restoreFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  // Swipe-to-dismiss. Bound natively on the handle (React's delegated pointer
  // events proved unreliable under mobile emulation); move/up live on `document`
  // so tracking survives the finger leaving the handle, and `touch-action: none`
  // on the handle stops the page scrolling underneath. A real drag is only
  // recognised past a few px, so a plain tap still fires the grabber's click.
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const handle = handleRef.current;
    if (!panel || !handle) return;

    const setDragY = (px: number) => {
      panel.style.transform = px ? `translateY(${px}px)` : '';
    };
    const setDragging = (on: boolean) => {
      panel.classList.toggle('vt-sheet__panel--dragging', on);
    };
    setDragY(0);
    setDragging(false);

    let startY = 0;
    let captured = false;

    const onMove = (ev: PointerEvent) => {
      const dy = ev.clientY - startY;
      if (dy <= 0) {
        if (captured) setDragY(0);
        return; // only track downward drags
      }
      if (!captured && dy > 4) {
        captured = true;
        setDragging(true);
      }
      if (captured) setDragY(dy);
    };
    const onUp = (ev: PointerEvent) => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
      if (!captured) return; // a tap — let the grabber's click handle it
      setDragging(false);
      if (ev.clientY - startY > DISMISS_AFTER) onClose();
      setDragY(0);
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      startY = e.clientY;
      captured = false;
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
      document.addEventListener('pointercancel', onUp);
    };

    handle.addEventListener('pointerdown', onDown);
    return () => {
      handle.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="vt-sheet" role="presentation">
      <div className="vt-sheet__scrim" onClick={onClose} aria-hidden="true" />

      <div
        className="vt-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        ref={(el) => {
          sheetRef.current = el;
          panelRef.current = el;
        }}
        tabIndex={-1}
      >
        <div className="vt-sheet__handle" ref={handleRef}>
          <button type="button" className="vt-sheet__grabber" aria-label="Close" onClick={onClose} />
          {handleContent}
        </div>

        {children}
      </div>
    </div>
  );
}
