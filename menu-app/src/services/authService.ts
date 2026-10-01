import type { AuthUser } from "../types/AuthUser";

export type LoginResult =
  | { success: true; user: AuthUser }
  | { success: false; error: string };

const MOCK_EMAIL = "demo@tienda.com";
const MOCK_PASSWORD = "demo123";

function simulateNetworkDelay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 400));
}

/**
 * Mock de autenticación. El día que haya backend real, reemplazar el
 * cuerpo de esta función por la llamada a la API (ej. fetch a /api/login)
 * manteniendo la misma firma, para no tener que tocar los componentes
 * que la consumen.
 */
export async function login(email: string, password: string): Promise<LoginResult> {
  await simulateNetworkDelay();

  if (email === MOCK_EMAIL && password === MOCK_PASSWORD) {
    return { success: true, user: { name: "Usuario Demo", email } };
  }

  return { success: false, error: "Credenciales inválidas." };
}

/**
 * Mock de login social. Simula una respuesta exitosa de OAuth sin
 * conectar ninguna librería real; reemplazar por la integración real
 * (Google/Facebook SDK + backend) cuando esté disponible.
 */
export async function loginWithProvider(
  provider: "google" | "facebook"
): Promise<LoginResult> {
  await simulateNetworkDelay();

  const providerLabel = provider === "google" ? "Google" : "Facebook";
  return {
    success: true,
    user: { name: `Usuario Demo (${providerLabel})`, email: MOCK_EMAIL },
  };
}
