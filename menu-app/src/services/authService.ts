import type { AuthUser } from "../types/AuthUser";
import { API_URL, getErrorMessage } from "./api";

export type LoginResult =
  | { success: true; user: AuthUser }
  | { success: false; error: string };

const TOKEN_KEY = "authToken";

// Forma en que el backend devuelve al usuario y la respuesta de login/registro
interface UserResponse {
  idUser: number;
  userName: string;
  email: string;
  role: "ADMIN" | "CLIENT";
}

interface AuthResponse {
  token: string;
  expiresInMinutes: number;
  user: UserResponse;
}

function toAuthUser(user: UserResponse, token: string): AuthUser {
  return { idUser: user.idUser, name: user.userName, email: user.email, role: user.role, token };
}

// El token se guarda en localStorage para que la sesión sobreviva a una recarga.
// Si el navegador bloquea el almacenamiento (ej. modo privado), la sesión dura hasta recargar.
function saveToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // sin almacenamiento disponible
  }
}

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // sin almacenamiento disponible
  }
}

// Login y registro responden igual (token + usuario), así que comparten el manejo de la respuesta
async function authenticate(path: string, body: object, fallbackError: string): Promise<LoginResult> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return { success: false, error: await getErrorMessage(response, fallbackError) };
    }

    const data: AuthResponse = await response.json();
    saveToken(data.token);
    return { success: true, user: toAuthUser(data.user, data.token) };
  } catch {
    return { success: false, error: "No se pudo conectar con el servidor." };
  }
}

export function login(email: string, password: string): Promise<LoginResult> {
  return authenticate("/api/auth/login", { email, password }, "No se pudo iniciar sesión.");
}

export function register(name: string, email: string, password: string): Promise<LoginResult> {
  return authenticate(
    "/api/auth/register",
    { userName: name, email, password },
    "No se pudo crear la cuenta."
  );
}

// Recupera la sesión guardada al recargar la página, validando el token con el backend.
// Si el token venció o es inválido (401), se descarta. Si el backend no responde, se conserva
// el token para intentarlo en la próxima carga.
export async function restoreSession(): Promise<AuthUser | null> {
  const token = readToken();
  if (!token) return null;

  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      clearToken();
      return null;
    }
    const user: UserResponse = await response.json();
    return toAuthUser(user, token);
  } catch {
    return null;
  }
}

export function logout() {
  clearToken();
}
