export const API_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

// El backend devuelve los errores como { status, error, message, path }: se muestra el message.
// Si la respuesta no trae ese formato, se usa el texto por defecto.
export async function getErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const body = await response.json();
    return typeof body.message === "string" ? body.message : fallback;
  } catch {
    return fallback;
  }
}

// Error de una llamada a la API. status es el código HTTP (0 si no hubo conexión),
// así quien la llama puede distinguir, por ejemplo, una sesión vencida (401) de falta de stock (409).
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// true si el error es porque el token venció o ya no es válido
export function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

interface RequestOptions {
  method?: string;
  token?: string;
  body?: unknown;
}

// Llama a la API con el token del usuario y devuelve el JSON de la respuesta.
// Si la respuesta es un error, lanza ApiError con el mensaje que manda el backend.
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError(0, "No se pudo conectar con el servidor.");
  }

  if (!response.ok) {
    throw new ApiError(response.status, await getErrorMessage(response, "Ocurrió un error inesperado."));
  }
  return response.json();
}
