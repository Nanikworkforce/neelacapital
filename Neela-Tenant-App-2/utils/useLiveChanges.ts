import { useEffect, useRef } from 'react';
import { api } from '../services/api';

export type LiveArea =
  | 'tenants'
  | 'payments'
  | 'maintenance'
  | 'inquiries'
  | 'legal'
  | 'properties'
  | 'expenses'
  | 'short_stays';

export const LIVE_CHANGES_EVENT = 'neela:live-changes';

const POLL_MS = 25_000;
const MIN_GAP_MS = 5_000;

/**
 * Polls a tiny version map while the tab is visible and calls `onChange` with
 * only the areas that changed. Also broadcasts them on window so views that
 * load their own data (inquiries, legal, short stays) can refresh themselves.
 */
export function useLiveChanges(enabled: boolean, onChange: (areas: LiveArea[]) => void) {
  const handlerRef = useRef(onChange);
  handlerRef.current = onChange;

  useEffect(() => {
    if (!enabled) return;
    let versions: Record<string, number> | null = null;
    let inFlight = false;
    let lastCheck = 0;
    let stopped = false;

    const check = async () => {
      if (stopped || inFlight || document.visibilityState !== 'visible') return;
      if (Date.now() - lastCheck < MIN_GAP_MS) return;
      inFlight = true;
      lastCheck = Date.now();
      try {
        const next = await api.getLiveChanges();
        if (stopped) return;
        if (versions) {
          const changed = Object.keys(next).filter((k) => next[k] !== versions![k]) as LiveArea[];
          if (changed.length) {
            handlerRef.current(changed);
            window.dispatchEvent(new CustomEvent(LIVE_CHANGES_EVENT, { detail: changed }));
          }
        }
        versions = next;
      } catch {
        /* offline or logged out — try again next tick */
      } finally {
        inFlight = false;
      }
    };

    check();
    const timer = window.setInterval(check, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') check();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      stopped = true;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [enabled]);
}

/** Run `refresh` whenever one of `areas` changes on the server. */
export function useOnLiveChange(areas: LiveArea[], refresh: () => void) {
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;
  const key = areas.join(',');

  useEffect(() => {
    const wanted = key.split(',');
    const listener = (e: Event) => {
      const changed = (e as CustomEvent<string[]>).detail || [];
      if (changed.some((a) => wanted.includes(a))) refreshRef.current();
    };
    window.addEventListener(LIVE_CHANGES_EVENT, listener);
    return () => window.removeEventListener(LIVE_CHANGES_EVENT, listener);
  }, [key]);
}
