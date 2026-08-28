/** Single Render backend for main site + portal + admin + manager. */
export const BACKEND_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ||
  'https://neela-backend-96ia.onrender.com'

export const PROPERTIES_API = `${BACKEND_URL}/api/properties`
export const INQUIRIES_API = `${BACKEND_URL}/api/inquiries/`
