import { storage } from "../utils/storage";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function http<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = storage.getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}
