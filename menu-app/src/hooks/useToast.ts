import { useCallback, useState } from "react";

// Estado del toast de aviso. key se incrementa en cada notify: si el toast ya estaba visible,
// fuerza el remount de <Toast> para reiniciar su temporizador de auto-cierre.
export function useToast() {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("Agregado");
  const [key, setKey] = useState(0);

  const notify = useCallback((text: string) => {
    setMessage(text);
    setShow(true);
    setKey((k) => k + 1);
  }, []);

  const close = useCallback(() => setShow(false), []);

  return { notify, toast: { key, show, message, onClose: close } };
}
