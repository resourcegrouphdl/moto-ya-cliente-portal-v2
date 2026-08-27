import { auth } from "./firebase";
import { GATEWAY_BASE_URL } from "./firebase";

/** Cuerpo de error que ya devuelve motoya-api/api-gateway (ResponseStatusException -> ProblemDetail estándar de Spring). */
interface ProblemDetail {
  detail?: string;
  title?: string;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Todo lo que el portal necesita para hablar con `/client/**` en api-gateway: token de Firebase en cada
 * request (nunca cacheado del lado del cliente más allá de lo que el propio SDK de Firebase ya
 * gestiona), y un error tipado con el `detail` real que ya manda el backend en vez de un mensaje
 * genérico de `fetch`.
 */
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await auth.currentUser?.getIdToken();
  const headers: HeadersInit = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${GATEWAY_BASE_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    const mensaje = await mensajeDeError(response);
    throw new ApiError(response.status, mensaje);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

async function mensajeDeError(response: Response): Promise<string> {
  try {
    const cuerpo = (await response.json()) as ProblemDetail;
    return cuerpo.detail ?? cuerpo.title ?? `Error ${response.status}`;
  } catch {
    return `Error ${response.status}`;
  }
}

export function apiGet<T>(path: string): Promise<T> {
  return apiFetch<T>(path, { method: "GET" });
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return apiFetch<T>(path, { method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined });
}
