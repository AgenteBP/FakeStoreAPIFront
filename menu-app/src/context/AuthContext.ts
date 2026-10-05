import { createContext } from "react";
import type { AuthUser } from "../types/AuthUser";

export interface AuthContextValue {
  user: AuthUser | null;
  isLoginOpen: boolean;
  signIn: (user: AuthUser) => void;
  signOut: () => void;
  // El backend respondió 401 (el token venció): cierra la sesión y abre el login
  expireSession: () => void;
  openLogin: () => void;
  closeLogin: () => void;
}

// Vale null fuera de <AuthProvider>: useAuth lo detecta y avisa con un error
export const AuthContext = createContext<AuthContextValue | null>(null);
