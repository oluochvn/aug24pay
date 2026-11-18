export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "https://augbcknov1.onrender.com";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
};

let token: string | null = null;
let onUnauthorized = () => {};

export const setApiToken = (value: string | null) => {
  token = value;
};

export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler;
};

export async function apiRequest<T>(
  path: string,
  { method = "GET", body, auth = true }: RequestOptions = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

  const result: unknown = await response.json().catch(() => null);

  if (response.status === 401 && auth) {
    onUnauthorized();
    throw new Error("Your session expired. Please log in again.");
  }

  if (!response.ok) {
    const message =
      typeof result === "object" && result !== null && "message" in result
        ? String(result.message)
        : typeof result === "object" && result !== null && "error" in result
          ? String(result.error)
          : `Request failed (${response.status})`;
    throw new Error(message);
  }

  return result as T;
}
