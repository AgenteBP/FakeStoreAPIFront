import { useEffect, useState } from "react";
import type { Order, OrderStatus } from "../../types/Order";
import { changeOrderStatus, getAllOrders } from "../../services/adminService";
import { useApiError } from "../../hooks/useApiError";
import { useCurrentUser } from "../../hooks/useAuth";
import { canAdminCancel, formatOrderDate, getNextStatus, getStatusLabel } from "../../utils/orderStatus";

interface AdminOrdersProps {
  // Cancelar devuelve stock: avisa para recargar el catálogo
  onStockChanged: () => void;
}

const STATUS_FILTERS: OrderStatus[] = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];

// Igual que "Mis compras": se actualiza sola para ver el avance automático de los estados
const REFRESH_INTERVAL_MS = 15_000;

// Todas las compras de la tienda. El ADMIN puede pasar cada una al siguiente paso o cancelarla.
function AdminOrders({ onStockChanged }: AdminOrdersProps) {
  const admin = useCurrentUser();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [busyId, setBusyId] = useState<number | null>(null);
  const { error, handleError, clearError } = useApiError();

  useEffect(() => {
    const loadOrders = () => getAllOrders(admin).then(setOrders).catch(handleError);
    loadOrders();
    const intervalId = setInterval(loadOrders, REFRESH_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [admin, handleError]);

  const handleChangeStatus = async (order: Order, next: OrderStatus) => {
    setBusyId(order.idOrder);
    clearError();
    try {
      const updated = await changeOrderStatus(admin, order.idOrder, next);
      setOrders((prev) => (prev ?? []).map((o) => (o.idOrder === updated.idOrder ? updated : o)));
      if (next === "CANCELLED") onStockChanged();
    } catch (err) {
      // Ej. 409 si la tarea automática la avanzó justo antes: se muestra el mensaje del backend
      handleError(err);
    } finally {
      setBusyId(null);
    }
  };

  if (orders === null) {
    return error ? <p className="auth-error">{error}</p> : <p className="text-muted">Cargando compras...</p>;
  }

  const visibleOrders = statusFilter === "ALL" ? orders : orders.filter((o) => o.status === statusFilter);

  return (
    <>
      {error && <p className="auth-error">{error}</p>}

      <div className="admin-filters" role="group" aria-label="Filtrar compras por estado">
        <button
          type="button"
          className={`admin-filter-chip ${statusFilter === "ALL" ? "active" : ""}`}
          onClick={() => setStatusFilter("ALL")}
        >
          Todas ({orders.length})
        </button>
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            type="button"
            className={`admin-filter-chip ${statusFilter === status ? "active" : ""}`}
            onClick={() => setStatusFilter(status)}
          >
            {getStatusLabel(status)} ({orders.filter((o) => o.status === status).length})
          </button>
        ))}
      </div>

      {visibleOrders.length === 0 ? (
        <p className="text-center text-muted py-4">No hay compras en este estado</p>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle admin-table">
            <thead>
              <tr>
                <th>Compra</th>
                <th>Cliente</th>
                <th>Productos</th>
                <th className="text-end">Total</th>
                <th>Estado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibleOrders.map((order) => {
                const next = getNextStatus(order.status);
                const busy = busyId === order.idOrder;
                return (
                  <tr key={order.idOrder}>
                    <td>
                      <div className="fw-semibold">#{order.idOrder}</div>
                      <div className="admin-subtext">{formatOrderDate(order.orderDate)}</div>
                    </td>
                    <td>
                      <div>{order.customerName}</div>
                      <div className="admin-subtext">{order.customerEmail}</div>
                    </td>
                    <td className="admin-subtext">
                      {order.items.map((item) => `${item.quantity} × ${item.productName}`).join(", ")}
                    </td>
                    <td className="text-end fw-semibold">${order.total.toFixed(2)}</td>
                    <td>
                      <span className={`order-status order-status-${order.status.toLowerCase()}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-2">
                        {canAdminCancel(order.status) && (
                          <button
                            type="button"
                            className="order-action-btn"
                            onClick={() => handleChangeStatus(order, "CANCELLED")}
                            disabled={busy}
                            aria-label={`Cancelar compra ${order.idOrder}`}
                          >
                            Cancelar
                          </button>
                        )}
                        {next && (
                          <button
                            type="button"
                            className="btn btn-red-gradient btn-sm"
                            onClick={() => handleChangeStatus(order, next)}
                            disabled={busy}
                          >
                            Pasar a {getStatusLabel(next)}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default AdminOrders;
