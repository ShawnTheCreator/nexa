// frontend/lib/api.ts
// When using proxy or local backend, allow overriding the API base URL via
// NEXT_PUBLIC_API_BASE_URL. If not provided we keep the previous behavior
// and call relative paths (same-origin) so the app can still function
// when backend is served from the same origin.
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export async function apiFetch(path: string, options: RequestInit = {}) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${API_BASE_URL}${normalizedPath}`; // Becomes just `/api/...`

  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return res.text();
}