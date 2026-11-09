import fallbackMenu from '../data/menu.json';

const BASE = import.meta.env.VITE_API_URL || '/api';
export const API_BASE = BASE;

export async function api(path, { method = 'GET', body, token } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Is the API running?');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.errors = data.errors;
    throw err;
  }
  return data;
}

/** Static copy of the seed menu, used when the API is unreachable so the site still renders. */
export const offlineMenu = fallbackMenu.map((item, i) => ({ ...item, _id: `offline-${i}`, offline: true }));

export async function fetchMenu(params = {}) {
  const qs = new URLSearchParams(params).toString();
  try {
    return { items: await api(`/menu${qs ? `?${qs}` : ''}`), offline: false };
  } catch {
    const items = params.featured ? offlineMenu.filter((i) => i.featured) : offlineMenu;
    return { items, offline: true };
  }
}
