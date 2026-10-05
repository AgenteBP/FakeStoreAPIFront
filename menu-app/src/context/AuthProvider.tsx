import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AuthUser } from "../types/AuthUser";
import { logout, restoreSession } from "../services/authService";
import { AuthContext } from "./AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}

// Guarda la sesión del usuario y si el modal de login está abierto, para que cualquier
// componente lo lea con useAuth() en vez de recibirlo por props.
function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Si había una sesión guardada (token en localStorage) y sigue vigente, se recupera
  useEffect(() => {
    restoreSession().then((restoredUser) => {
      if (restoredUser) setUser(restoredUser);
    });
  }, []);

  // useCallback: varios componentes usan estas funciones en las dependencias de sus useEffect,
  // así que tienen que mantener la misma referencia entre renders
  const signIn = useCallback((loggedInUser: AuthUser) => {
    setUser(loggedInUser);
    setIsLoginOpen(false);
  }, []);

  const signOut = useCallback(() => {
    logout();
    setUser(null);
  }, []);

  const expireSession = useCallback(() => {
    logout();
    setUser(null);
    setIsLoginOpen(true);
  }, []);

  const openLogin = useCallback(() => setIsLoginOpen(true), []);
  const closeLogin = useCallback(() => setIsLoginOpen(false), []);

  const value = useMemo(
    () => ({ user, isLoginOpen, signIn, signOut, expireSession, openLogin, closeLogin }),
    [user, isLoginOpen, signIn, signOut, expireSession, openLogin, closeLogin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
