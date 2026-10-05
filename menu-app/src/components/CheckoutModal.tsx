import { useEffect, useState } from "react";
import type { Address, NewAddress } from "../types/Address";
import type { CartItem } from "../types/CartItem";
import type { Order } from "../types/Order";
import { isUnauthorized } from "../services/api";
import { createAddress, getAddresses } from "../services/addressService";
import { createOrder, payOrder } from "../services/orderService";
import { getStatusLabel } from "../utils/orderStatus";
import { useAuth, useCurrentUser } from "../hooks/useAuth";
import Modal from "./Modal";
import AddressForm from "./AddressForm";

interface CheckoutModalProps {
  cart: CartItem[];
  onClose: () => void;
  // Se llama apenas el backend crea la compra (para vaciar el carrito y actualizar el stock)
  onOrderCreated: () => void;
  onOpenOrders: () => void;
}

// Checkout en dos pasos:
//   1. Elegir (o cargar) la dirección de envío y confirmar → POST /api/orders (queda PENDING).
//   2. Confirmación: se puede pagar en el momento (pago simulado) o ir a "Mis compras".
function CheckoutModal({ cart, onClose, onOrderCreated, onOpenOrders }: CheckoutModalProps) {
  const user = useCurrentUser();
  const { expireSession } = useAuth();
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Un 401 significa que venció la sesión: se cierra y se pide login de nuevo.
  // Cualquier otro error (ej. 409 sin stock) se muestra y el carrito queda como estaba.
  const handleError = (err: unknown) => {
    if (isUnauthorized(err)) {
      expireSession();
      return;
    }
    setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
  };

  // Al abrir se traen las direcciones guardadas; si no hay ninguna, se muestra el formulario
  useEffect(() => {
    getAddresses(user)
      .then((list) => {
        setAddresses(list);
        setSelectedAddressId(list.length > 0 ? list[0].idAddress : null);
        setShowAddressForm(list.length === 0);
      })
      .catch((err) => {
        if (isUnauthorized(err)) {
          expireSession();
          return;
        }
        setError(err instanceof Error ? err.message : "No se pudieron cargar las direcciones.");
      });
  }, [user, expireSession]);

  const handleSaveAddress = async (newAddress: NewAddress) => {
    setSubmitting(true);
    setError("");
    try {
      const saved = await createAddress(user, newAddress);
      setAddresses((prev) => [...(prev ?? []), saved]);
      setSelectedAddressId(saved.idAddress);
      setShowAddressForm(false);
    } catch (err) {
      handleError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async () => {
    if (selectedAddressId === null) return;
    setSubmitting(true);
    setError("");
    try {
      const order = await createOrder(user, selectedAddressId, cart);
      setCreatedOrder(order);
      onOrderCreated();
    } catch (err) {
      handleError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayNow = async () => {
    if (!createdOrder) return;
    setSubmitting(true);
    setError("");
    try {
      setCreatedOrder(await payOrder(user, createdOrder.idOrder));
    } catch (err) {
      handleError(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (createdOrder) {
    return (
      <Modal title="¡Compra creada!" onClose={onClose}>
        {error && <p className="auth-error">{error}</p>}
        <p className="mb-1">
          Compra <strong>#{createdOrder.idOrder}</strong> por{" "}
          <strong>${createdOrder.total.toFixed(2)}</strong>
        </p>
        <p className="mb-3">
          Estado: <span className={`order-status order-status-${createdOrder.status.toLowerCase()}`}>
            {getStatusLabel(createdOrder.status)}
          </span>
        </p>

        {createdOrder.status === "PENDING" && (
          <>
            <p className="checkout-hint">
              El pago es simulado: podés pagarla ahora o, si no, se paga sola en unos minutos.
            </p>
            <button type="button" className="btn btn-red-gradient w-100 mb-2" onClick={handlePayNow} disabled={submitting}>
              {submitting ? "Pagando..." : "Pagar ahora"}
            </button>
          </>
        )}

        <button type="button" className="order-action-btn w-100" onClick={onOpenOrders}>
          Ver mis compras
        </button>
      </Modal>
    );
  }

  const total = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return (
    <Modal title="Finalizar compra" onClose={onClose}>
      {error && <p className="auth-error">{error}</p>}

      <h6 className="checkout-section-title">Dirección de envío</h6>
      {addresses === null ? (
        <p className="text-muted">Cargando direcciones...</p>
      ) : showAddressForm ? (
        <AddressForm
          submitting={submitting}
          onSubmit={handleSaveAddress}
          onCancel={addresses.length > 0 ? () => setShowAddressForm(false) : undefined}
        />
      ) : (
        <>
          {addresses.map((address) => (
            <label className="checkout-address-option" key={address.idAddress}>
              <input
                type="radio"
                name="shipping-address"
                checked={selectedAddressId === address.idAddress}
                onChange={() => setSelectedAddressId(address.idAddress)}
              />
              <span>
                {address.street}, {address.city}, {address.province} ({address.postalCode}), {address.country}
              </span>
            </label>
          ))}
          <button type="button" className="checkout-link-btn" onClick={() => setShowAddressForm(true)}>
            + Agregar otra dirección
          </button>
        </>
      )}

      <h6 className="checkout-section-title mt-4">Resumen</h6>
      <ul className="checkout-summary">
        {cart.map((item) => (
          <li key={item.product.id}>
            <span>
              {item.quantity} × {item.product.title}
            </span>
            <span>${(item.product.price * item.quantity).toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="cart-summary-label">Total</span>
        <span className="cart-summary-total">${total.toFixed(2)}</span>
      </div>

      <button
        type="button"
        className="btn btn-red-gradient w-100"
        onClick={handleConfirm}
        disabled={submitting || showAddressForm || selectedAddressId === null}
      >
        {submitting ? "Procesando..." : "Confirmar compra"}
      </button>
    </Modal>
  );
}

export default CheckoutModal;
