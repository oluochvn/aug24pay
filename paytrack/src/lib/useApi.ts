import { useCallback, useEffect, useRef, useState } from "react";

const API = import.meta.env.VITE_API_URL || "https://pay-8mq3.onrender.com";

const cache = new Map<string, unknown>();

export const clearCache = () => cache.clear();

export const invalidate = (prefix: string) => {
  for (const key of Array.from(cache.keys())) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
};

async function getJson<T>(path: string): Promise<T> {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.assign("/login");
    throw new Error("Please log in");
  }

  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const text = await res.text();
  let body: { message?: string };
  try {
    body = JSON.parse(text);
  } catch {
    throw new Error(
      res.status === 404
        ? "API route not found. Redeploy the backend."
        : "Server is starting up. Try again in a minute."
    );
  }

  if (res.status === 401) {
    localStorage.removeItem("token");
    clearCache();
    window.location.assign("/login");
    throw new Error("Session expired");
  }
  if (!res.ok) throw new Error(body.message || "Could not load data");
  return body as unknown as T;
}

export function useApi<T>(path: string) {
  const [data, setData] = useState<T | null>(() => (cache.get(path) as T) ?? null);
  const [loading, setLoading] = useState(!cache.has(path));
  const [error, setError] = useState("");
  const currentPath = useRef(path);
  currentPath.current = path;

  const refresh = useCallback(async () => {
    try {
      const body = await getJson<T>(path);
      cache.set(path, body);
      if (currentPath.current === path) {
        setData(body);
        setError("");
      }
    } catch (err) {
      if (currentPath.current === path) setError((err as Error).message);
    } finally {
      if (currentPath.current === path) setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    setData((cache.get(path) as T) ?? null);
    setLoading(!cache.has(path));
    refresh();
  }, [path, refresh]);

  const update = (value: T) => {
    cache.set(path, value);
    setData(value);
  };

  return { data, loading, error, refresh, update };
}