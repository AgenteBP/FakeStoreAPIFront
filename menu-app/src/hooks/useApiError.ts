import { useCallback, useState } from "react";
import { isUnauthorized } from "../services/api";
import { useAuth } from "./useAuth";

// Manejo de errores de la API que comparten las vistas del panel de administración:
// un 401 (sesión vencida) cierra la sesión; cualquier otro error se guarda para mostrarlo.
export function useApiError() {
  const { expireSession } = useAuth();
  const [error, setError] = useState("");

  const handleError = useCallback(
    (err: unknown) => {
      if (isUnauthorized(err)) {
        expireSession();
        return;
      }
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
    },
    [expireSession]
  );

  const clearError = useCallback(() => setError(""), []);

  return { error, handleError, clearError };
}
