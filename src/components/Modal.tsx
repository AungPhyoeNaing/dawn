import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

let openDialogs = 0;
let restorePage = () => {};

/** Keep dialogs within Safari's visible area, including above its keyboard. */
export function Modal({ children, label, onClose, fullScreen = false, className = '' }: {
  children: ReactNode;
  label: string;
  onClose: () => void;
  fullScreen?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);

  useEffect(() => {
    const panel = ref.current!;
    const previousFocus = document.activeElement as HTMLElement | null;
    if (openDialogs++ === 0) {
      const y = window.scrollY;
      const root = document.getElementById('root');
      const wasInert = root?.inert ?? false;
      if (root) root.inert = true;
      const previous = { position: document.body.style.position, top: document.body.style.top, width: document.body.style.width, overflow: document.body.style.overflow };
      Object.assign(document.body.style, { position: 'fixed', top: `-${y}px`, width: '100%', overflow: 'hidden' });
      restorePage = () => {
        if (root) root.inert = wasInert;
        Object.assign(document.body.style, previous);
        window.scrollTo(0, y);
      };
    }
    const updateViewport = () => {
      const viewport = window.visualViewport;
      panel.style.height = `${viewport?.height ?? window.innerHeight}px`;
      panel.style.top = `${viewport?.offsetTop ?? 0}px`;
    };
    updateViewport();
    window.visualViewport?.addEventListener('resize', updateViewport);
    window.visualViewport?.addEventListener('scroll', updateViewport);
    window.addEventListener('resize', updateViewport);
    panel.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => {
      const dialogs = document.querySelectorAll('.modal-layer');
      if (dialogs[dialogs.length - 1] !== panel) return;
      if (event.key === 'Escape') { event.preventDefault(); closeRef.current(); }
      if (event.key === 'Tab') {
        const controls = [...panel.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled):not([type="hidden"]), textarea:not(:disabled), select:not(:disabled), [href], [tabindex="0"]')].filter(el => el.getClientRects().length > 0);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (!first) { event.preventDefault(); panel.focus(); }
        else if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || document.activeElement === panel)) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      window.visualViewport?.removeEventListener('resize', updateViewport);
      window.visualViewport?.removeEventListener('scroll', updateViewport);
      window.removeEventListener('resize', updateViewport);
      document.removeEventListener('keydown', onKey);
      if (--openDialogs === 0) restorePage();
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  return createPortal(<div ref={ref} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} className={`modal-layer ${fullScreen ? 'modal-fullscreen' : 'modal-centered'} ${className}`}>{children}</div>, document.body);
}
