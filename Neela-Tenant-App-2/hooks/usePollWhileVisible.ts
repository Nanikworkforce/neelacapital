import { useEffect, useRef } from 'react';

/**
 * Runs `fn` on an interval while the document is visible, and again immediately
 * when the tab becomes visible or the window regains focus.
 * Keeps dashboards fresh without a manual reload.
 */
export function usePollWhileVisible(
  fn: () => void | Promise<void>,
  intervalMs: number,
  enabled = true,
): void {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    if (!enabled || intervalMs <= 0) return;

    let cancelled = false;
    let inFlight = false;

    const run = () => {
      if (cancelled || inFlight || document.visibilityState === 'hidden') return;
      inFlight = true;
      void Promise.resolve(fnRef.current())
        .catch(() => {
          // Keep last good data on network/API errors.
        })
        .finally(() => {
          inFlight = false;
        });
    };

    const id = window.setInterval(run, intervalMs);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') run();
    };
    const onFocus = () => run();

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onFocus);

    return () => {
      cancelled = true;
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onFocus);
    };
  }, [intervalMs, enabled]);
}

export default usePollWhileVisible;
