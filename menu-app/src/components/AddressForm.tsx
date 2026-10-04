import { useState, type FormEvent } from "react";
import type { NewAddress } from "../types/Address";

interface AddressFormProps {
  submitting: boolean;
  onSubmit: (address: NewAddress) => void;
  // Si no se pasa, no se muestra el botón "Cancelar" (ej. cuando es la primera dirección)
  onCancel?: () => void;
}

const EMPTY_ADDRESS: NewAddress = { street: "", city: "", province: "", postalCode: "", country: "" };

// Etiqueta y autocompletado del navegador para cada campo
const FIELDS: { name: keyof NewAddress; label: string; autoComplete: string }[] = [
  { name: "street", label: "Calle y número", autoComplete: "street-address" },
  { name: "city", label: "Ciudad", autoComplete: "address-level2" },
  { name: "province", label: "Provincia", autoComplete: "address-level1" },
  { name: "postalCode", label: "Código postal", autoComplete: "postal-code" },
  { name: "country", label: "País", autoComplete: "country-name" },
];

function AddressForm({ submitting, onSubmit, onCancel }: AddressFormProps) {
  const [address, setAddress] = useState<NewAddress>(EMPTY_ADDRESS);
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const hasEmptyField = FIELDS.some((field) => !address[field.name].trim());
    if (hasEmptyField) {
      setError("Completá todos los campos de la dirección.");
      return;
    }
    setError("");
    onSubmit(address);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="checkout-address-form">
      {error && <p className="auth-error">{error}</p>}

      {FIELDS.map((field) => (
        <div className="mb-2" key={field.name}>
          <label htmlFor={`address-${field.name}`} className="auth-label">
            {field.label}
          </label>
          <input
            id={`address-${field.name}`}
            className="auth-input"
            value={address[field.name]}
            onChange={(e) => setAddress({ ...address, [field.name]: e.target.value })}
            autoComplete={field.autoComplete}
          />
        </div>
      ))}

      <div className="d-flex gap-2 mt-3">
        {onCancel && (
          <button type="button" className="order-action-btn flex-fill" onClick={onCancel} disabled={submitting}>
            Cancelar
          </button>
        )}
        <button type="submit" className="btn btn-red-gradient flex-fill" disabled={submitting}>
          {submitting ? "Guardando..." : "Guardar dirección"}
        </button>
      </div>
    </form>
  );
}

export default AddressForm;
