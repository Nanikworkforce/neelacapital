import { useEffect, useRef } from 'react';

/**
 * Runs `fn` on an interval while the document is visible.
 * Optionally also runs when the tab becomes visible or the window regains focus.
 */
export function usePollWhileVisible(
  fn: () => void | Promise<void>,
  intervalMs: number,
  enabled = true,
  options?: { runOnFocus?: boolean },
): void {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const runOnFocus = options?.runOnFocus !== false;

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
      if (runOnFocus && document.visibilityState === 'visible') run();
    };
    const onFocus = () => {
      if (runOnFocus) run();
    };

    if (runOnFocus) {
      document.addEventListener('visibilitychange', onVisibility);
      window.addEventListener('focus', onFocus);
    }

    return () => {
      cancelled = true;
      window.clearInterval(id);
      if (runOnFocus) {
        document.removeEventListener('visibilitychange', onVisibility);
        window.removeEventListener('focus', onFocus);
      }
    };
  }, [intervalMs, enabled, runOnFocus]);
}

export default usePollWhileVisible;
