import { useState, type FormEvent } from "react";
import type { AuthUser } from "../types/AuthUser";
import { register } from "../services/authService";
import { isValidEmail } from "../utils/validation";

interface RegisterFormProps {
  onRegisterSuccess: (user: AuthUser) => void;
}

function validate(name: string, email: string, password: string): string | null {
  if (!name.trim() || !email.trim() || !password.trim()) {
    return "Completá todos los campos.";
  }
  if (!isValidEmail(email)) {
    return "Ingresá un email válido.";
  }
  return null;
}

function RegisterForm({ onRegisterSuccess }: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationError = validate(name, email, password);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError("");
    const result = await register(name.trim(), email.trim(), password);
    setSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }
    onRegisterSuccess(result.user);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && <p className="auth-error">{error}</p>}

      <div className="mb-3">
        <label htmlFor="register-name" className="auth-label">
          Nombre
        </label>
        <input
          id="register-name"
          type="text"
          className="auth-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
          autoComplete="name"
        />
      </div>

      <div className="mb-3">
        <label htmlFor="register-email" className="auth-label">
          Email
        </label>
        <input
          id="register-email"
          type="email"
          className="auth-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          autoComplete="email"
        />
      </div>

      <div className="mb-3">
        <label htmlFor="register-password" className="auth-label">
          Contraseña
        </label>
        <input
          id="register-password"
          type="password"
          className="auth-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
        />
      </div>

      <button type="submit" className="btn btn-red-gradient w-100" disabled={submitting}>
        {submitting ? "Creando cuenta..." : "Crear cuenta"}
      </button>
    </form>
  );
}

export default RegisterForm;
