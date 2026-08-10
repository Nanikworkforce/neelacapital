/**
 * Authentication service for managing user session and tokens.
 *
 * Admin, property manager, and tenant sessions use separate localStorage keys
 * so two portals can stay logged in in different tabs without clobbering each other.
 */

export type AuthPortal = 'admin' | 'manager' | 'tenant';

const LEGACY_ACCESS = 'access_token';
const LEGACY_REFRESH = 'refresh_token';
const LEGACY_USER = 'user_data';

const portalKeys = (portal: AuthPortal) => ({
  access: `neela_${portal}_access_token`,
  refresh: `neela_${portal}_refresh_token`,
  user: `neela_${portal}_user_data`,
});

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_verified: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  role?: 'tenant' | 'property_manager';
}

export interface Tenant {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  property_unit: string;
  lease_start: string | null;
  lease_end: string | null;
  rent_amount: string;
  deposit: string;
  balance: string;
  credit_score: number | null;
  background_check_status: string | null;
  application_data: any;
  lease_status: string | null;
  signed_lease_url: string | null;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
  tenant: Tenant | null;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const detectAuthPortal = (): AuthPortal => {
  if (typeof window === 'undefined') return 'admin';
  const path = window.location.pathname || '/';
  if (path.startsWith('/manager')) return 'manager';
  if (path.startsWith('/tenant') || path.startsWith('/resident')) return 'tenant';
  return 'admin';
};

const userMatchesPortal = (user: User | null, portal: AuthPortal): boolean => {
  if (!user) return false;
  if (portal === 'admin') return !!(user.is_staff || user.is_superuser);
  if (portal === 'manager') {
    return user.role === 'property_manager' && !user.is_staff && !user.is_superuser;
  }
  return !user.is_staff && !user.is_superuser && user.role !== 'property_manager';
};

const readUserFromKey = (key: string): User | null => {
  const userStr = localStorage.getItem(key);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
};

/** Migrate once from legacy shared keys into portal-scoped keys when possible. */
const migrateLegacyIfNeeded = (portal: AuthPortal): void => {
  const keys = portalKeys(portal);
  if (localStorage.getItem(keys.access)) return;

  const legacyAccess = localStorage.getItem(LEGACY_ACCESS);
  const legacyUser = readUserFromKey(LEGACY_USER);
  if (!legacyAccess || !userMatchesPortal(legacyUser, portal)) return;

  localStorage.setItem(keys.access, legacyAccess);
  const legacyRefresh = localStorage.getItem(LEGACY_REFRESH);
  if (legacyRefresh) localStorage.setItem(keys.refresh, legacyRefresh);
  if (legacyUser) localStorage.setItem(keys.user, JSON.stringify(legacyUser));
};

const clearLegacyKeys = (): void => {
  localStorage.removeItem(LEGACY_ACCESS);
  localStorage.removeItem(LEGACY_REFRESH);
  localStorage.removeItem(LEGACY_USER);
};

export const login = async (
  email: string,
  password: string,
  portal: AuthPortal = detectAuthPortal(),
): Promise<LoginResponse> => {
  const response = await fetch(`${API_URL}/accounts/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Login failed' }));
    throw new Error(errorData.error || 'Login failed');
  }

  const data: LoginResponse = await response.json();
  const keys = portalKeys(portal);
  localStorage.setItem(keys.access, data.access);
  localStorage.setItem(keys.refresh, data.refresh);
  localStorage.setItem(keys.user, JSON.stringify(data.user));
  // Drop shared legacy keys so another portal login cannot clobber this one.
  clearLegacyKeys();

  return data;
};

/**
 * Logout the current portal session (or a specific portal).
 */
export const logout = (portal: AuthPortal = detectAuthPortal()): void => {
  const keys = portalKeys(portal);
  localStorage.removeItem(keys.access);
  localStorage.removeItem(keys.refresh);
  localStorage.removeItem(keys.user);
  clearLegacyKeys();
};

export const getAccessToken = (portal: AuthPortal = detectAuthPortal()): string | null => {
  migrateLegacyIfNeeded(portal);
  return localStorage.getItem(portalKeys(portal).access);
};

export const getRefreshToken = (portal: AuthPortal = detectAuthPortal()): string | null => {
  migrateLegacyIfNeeded(portal);
  return localStorage.getItem(portalKeys(portal).refresh);
};

export const getCurrentUser = (portal: AuthPortal = detectAuthPortal()): User | null => {
  migrateLegacyIfNeeded(portal);
  return readUserFromKey(portalKeys(portal).user);
};

export const updateStoredUser = (patch: Partial<User>, portal: AuthPortal = detectAuthPortal()): User | null => {
  const current = getCurrentUser(portal);
  if (!current) return null;
  const next = { ...current, ...patch };
  localStorage.setItem(portalKeys(portal).user, JSON.stringify(next));
  return next;
};

export const isAuthenticated = (portal: AuthPortal = detectAuthPortal()): boolean => {
  return !!getAccessToken(portal);
};

export const getAuthHeader = (portal: AuthPortal = detectAuthPortal()): string | null => {
  const token = getAccessToken(portal);
  return token ? `Bearer ${token}` : null;
};

export const clearInvalidTokens = (portal: AuthPortal = detectAuthPortal()): void => {
  logout(portal);
};

const decodeJWT = (token: string): any | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const isTokenExpiredOrExpiringSoon = (bufferMinutes: number = 5): boolean => {
  const token = getAccessToken();
  if (!token) return true;

  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;

  const expirationTime = decoded.exp * 1000;
  const currentTime = Date.now();
  const bufferTime = bufferMinutes * 60 * 1000;

  return expirationTime - currentTime < bufferTime;
};

export const refreshAccessToken = async (): Promise<{ access: string; refresh: string }> => {
  const portal = detectAuthPortal();
  const refreshToken = getRefreshToken(portal);
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await fetch(`${API_URL}/accounts/token/refresh/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Token refresh failed' }));
    if (response.status === 401) {
      clearInvalidTokens(portal);
    }
    throw new Error(errorData.detail || errorData.error || 'Token refresh failed');
  }

  const data = await response.json();
  const keys = portalKeys(portal);

  if (data.access) {
    localStorage.setItem(keys.access, data.access);
  }
  if (data.refresh) {
    localStorage.setItem(keys.refresh, data.refresh);
  }

  return {
    access: data.access,
    refresh: data.refresh || refreshToken,
  };
};

export const refreshTokenIfNeeded = async (): Promise<boolean> => {
  if (!isTokenExpiredOrExpiringSoon()) {
    return false;
  }

  try {
    await refreshAccessToken();
    return true;
  } catch (error) {
    console.warn('Failed to refresh token:', error);
    return false;
  }
};
