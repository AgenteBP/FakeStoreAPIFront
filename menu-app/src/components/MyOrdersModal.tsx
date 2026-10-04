import { useEffect, useState } from "react";
import type { AuthUser } from "../types/AuthUser";
import type { Order } from "../types/Order";
import { isUnauthorized } from "../services/api";
import { cancelOrder, getMyOrders, payOrder } from "../services/orderService";
import Modal from "./Modal";
import OrderCard from "./OrderCard";

interface MyOrdersModalProps {
  user: AuthUser;
  onClose: () => void;
  onSessionExpired: () => void;
  // Pagar o cancelar cambia el stock: avisa para recargar el catálogo
  onStockChanged: () => void;
}

// Cada cuánto se vuelven a pedir las compras mientras el modal está abierto.
// Así se ve cómo avanzan solas (pago, envío y entrega simulados) sin recargar la página.
const REFRESH_INTERVAL_MS = 15_000;

function MyOrdersModal({ user, onClose, onSessionExpired, onStockChanged }: MyOrdersModalProps) {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState("");
  const [busyOrderId, setBusyOrderId] = useState<number | null>(null);

  const handleError = (err: unknown) => {
    if (isUnauthorized(err)) {
      onSessionExpired();
      return;
    }
    setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
  };

  // Carga las compras al abrir y las actualiza cada REFRESH_INTERVAL_MS hasta que se cierra
  useEffect(() => {
    const loadOrders = () => {
      getMyOrders(user)
        .then(setOrders)
        .catch((err) => {
          if (isUnauthorized(err)) {
            onSessionExpired();
            return;
          }
          setError(err instanceof Error ? err.message : "No se pudieron cargar tus compras.");
        });
    };

    loadOrders();
    const intervalId = setInterval(loadOrders, REFRESH_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [user, onSessionExpired]);

  // Paga o cancela una compra y reemplaza esa compra en la lista con lo que devuelve el backend
  const runAction = async (idOrder: number, action: (user: AuthUser, idOrder: number) => Promise<Order>) => {
    setBusyOrderId(idOrder);
    setError("");
    try {
      const updated = await action(user, idOrder);
      setOrders((prev) => (prev ?? []).map((order) => (order.idOrder === idOrder ? updated : order)));
      onStockChanged();
    } catch (err) {
      handleError(err);
    } finally {
      setBusyOrderId(null);
    }
  };

  return (
    <Modal title="Mis compras" onClose={onClose} size="lg">
      {error && <p className="auth-error">{error}</p>}

      {orders === null ? (
        <p className="text-muted">Cargando compras...</p>
      ) : orders.length === 0 ? (
        <p className="text-center text-muted py-4">Todavía no hiciste ninguna compra</p>
      ) : (
        <div className="d-flex flex-column gap-3">
          {orders.map((order) => (
            <OrderCard
              key={order.idOrder}
              order={order}
              busy={busyOrderId === order.idOrder}
              onPay={(id) => runAction(id, payOrder)}
              onCancel={(id) => runAction(id, cancelOrder)}
            />
          ))}
        </div>
      )}
    </Modal>
  );
}

export default MyOrdersModal;
