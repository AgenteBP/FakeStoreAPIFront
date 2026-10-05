import { useContext } from "react";
import type { AuthUser } from "../types/AuthUser";
import { AuthContext, type AuthContextValue } from "../context/AuthContext";

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth se tiene que usar dentro de <AuthProvider>");
  }
  return context;
}

// Para componentes que solo se muestran con sesión iniciada (checkout, mis compras, panel admin):
// devuelve el usuario sin null, así no hace falta chequearlo en cada uno
export function useCurrentUser(): AuthUser {
  const { user } = useAuth();
  if (!user) {
    throw new Error("useCurrentUser requiere una sesión iniciada");
  }
  return user;
}
