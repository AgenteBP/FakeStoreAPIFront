import { useEffect, useState, type FormEvent } from "react";
import type { AuthUser } from "../types/AuthUser";
import { login } from "../services/authService";
import { isValidEmail } from "../utils/validation";
import RegisterForm from "./RegisterForm";

interface LoginModalProps {
  show: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
}

type Mode = "login" | "register";

function validate(email: string, password: string): string | null {
  if (!email.trim() || !password.trim()) {
    return "Completá todos los campos.";
  }
  if (!isValidEmail(email)) {
    return "Ingresá un email válido.";
  }
  return null;
}

function LoginModal({ show, onClose, onLoginSuccess }: LoginModalProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (show) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [show, onClose]);

  if (!show) return null;

  const resetForm = () => {
    setMode("login");
    setEmail("");
    setPassword("");
    setError("");
  };

  const resetAndClose = () => {
    resetForm();
    onClose();
  };

  const handleSuccess = (user: AuthUser) => {
    resetForm();
    onLoginSuccess(user);
  };

  const switchMode = (nextMode: Mode) => {
    setError("");
    setMode(nextMode);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationError = validate(email, password);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError("");
    const result = await login(email.trim(), password);
    setSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }
    handleSuccess(result.user);
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      onClick={resetAndClose}
      style={{
        backgroundColor: "rgba(15, 23, 42, 0.55)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content modal-content-app border-0 shadow">
          <div className="modal-header border-bottom-0 pb-0">
            <h5 className="modal-title fs-5 fw-bold" id="login-modal-title">
              {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Cerrar"
              onClick={resetAndClose}
            ></button>
          </div>

          <div className="modal-body p-4">
            {mode === "register" ? (
              <>
                <RegisterForm onRegisterSuccess={handleSuccess} />
                <p className="auth-hint">
                  ¿Ya tenés cuenta?{" "}
                  <button type="button" className="btn btn-link p-0 align-baseline" onClick={() => switchMode("login")}>
                    Iniciá sesión
                  </button>
                </p>
              </>
            ) : (
              <>
                {error && <p className="auth-error">{error}</p>}

                <form onSubmit={handleSubmit} noValidate>
                  <div className="mb-3">
                    <label htmlFor="login-email" className="auth-label">
                      Email
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      className="auth-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      autoComplete="email"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="login-password" className="auth-label">
                      Contraseña
                    </label>
                    <input
                      id="login-password"
                      type="password"
                      className="auth-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-red-gradient w-100"
                    disabled={submitting}
                  >
                    {submitting ? "Ingresando..." : "Iniciar sesión"}
                  </button>
                </form>

                <div className="auth-divider">
                  <span>o continuá con</span>
                </div>

                {/* Login social pendiente de integrar: los botones quedan visibles pero deshabilitados */}
                <div className="d-flex flex-column gap-2">
                  <button
                    type="button"
                    className="auth-provider-btn"
                    disabled
                    title="Próximamente"
                    aria-label="Continuar con Google (próximamente)"
                  >
                    <span className="auth-provider-icon auth-provider-icon-google">
                      G
                    </span>
                    Continuar con Google (próximamente)
                  </button>
                  <button
                    type="button"
                    className="auth-provider-btn"
                    disabled
                    title="Próximamente"
                    aria-label="Continuar con Facebook (próximamente)"
                  >
                    <span className="auth-provider-icon auth-provider-icon-facebook">
                      f
                    </span>
                    Continuar con Facebook (próximamente)
                  </button>
                </div>

                <p className="auth-hint">
                  ¿No tenés cuenta?{" "}
                  <button type="button" className="btn btn-link p-0 align-baseline" onClick={() => switchMode("register")}>
                    Creá una
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
