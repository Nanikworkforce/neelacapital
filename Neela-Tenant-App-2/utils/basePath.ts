/** Vite `base` without trailing slash, e.g. `/portal` */
export const APP_BASE = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

/** Staff dashboards live at the site root, not under `/portal`. */
export function isRootStaffPath(path: string): boolean {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return (
    normalized === '/admin' ||
    normalized.startsWith('/admin/') ||
    normalized === '/manager' ||
    normalized.startsWith('/manager/')
  );
}

/** Prefix a path for hard navigations / raw hrefs (Router Links need absolute paths). */
export function withBase(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (isRootStaffPath(normalized)) return normalized;
  if (!APP_BASE) return normalized;
  if (normalized === '/') return `${APP_BASE}/`;
  return `${APP_BASE}${normalized}`;
}

/** Public asset URL under the Vite base (e.g. `/portal/neela-logo.webp`). */
export function assetUrl(path: string): string {
  const cleaned = path.replace(/^\//, '');
  return `${import.meta.env.BASE_URL}${cleaned}`;
}

/**
 * Normalize pathname for in-app checks.
 * `/portal/tenant` → `/tenant`, `/admin` → `/admin`, `/manager/login` → `/manager/login`
 */
export function stripBase(pathname: string): string {
  const path = pathname || '/';
  if (isRootStaffPath(path)) return path;
  if (APP_BASE && path.startsWith(APP_BASE)) {
    const rest = path.slice(APP_BASE.length);
    return rest ? (rest.startsWith('/') ? rest : `/${rest}`) : '/';
  }
  return path;
}

/** Portal home URL (listings). */
export const PORTAL_HOME = APP_BASE ? `${APP_BASE}/` : '/';
