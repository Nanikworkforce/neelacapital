/**
 * Shared API origin for browser → Django calls.
 * Dev: empty string uses Vite proxy unless VITE_API_URL is set.
 * Prod: requires VITE_API_URL at build time; falls back to known Render host.
 */
export const PROD_API_ORIGIN = 'https://neela-backend-dfmg.onrender.com';

export function getApiOrigin(): string {
  const fromEnv = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, '');
  if (import.meta.env.DEV) return '';
  return PROD_API_ORIGIN;
}
