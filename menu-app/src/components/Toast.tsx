import { useEffect, useState } from "react";

interface Props {
  show: boolean;
  message?: string;
  duration?: number;
  onClose: () => void;
}

function Toast({ show, message = "Agregado", duration = 2500, onClose }: Props) {
  const [leaving, setLeaving] = useState(false);

  // App fuerza un remount (key) en cada addToCart, así que leaving
  // siempre arranca en false y este efecto solo programa el auto-cierre.
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => setLeaving(true), duration);
    return () => clearTimeout(timer);
  }, [show, duration]);

  if (!show) return null;

  return (
    <div
      className={`toast-cart ${leaving ? "toast-cart-out" : "toast-cart-in"}`}
      role="status"
      aria-live="polite"
      onAnimationEnd={() => {
        if (leaving) onClose();
      }}
    >
      <span className="toast-cart-icon" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 13l4 4L19 7"
            stroke="#fff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="toast-cart-text">{message}</span>
      <button
        type="button"
        className="toast-cart-close"
        aria-label="Cerrar notificación"
        onClick={() => setLeaving(true)}
      >
        ×
      </button>
    </div>
  );
}

export default Toast;
