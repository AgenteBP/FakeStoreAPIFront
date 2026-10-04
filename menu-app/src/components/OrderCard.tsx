import type { Order } from "../types/Order";
import { formatOrderDate, getStatusLabel } from "../utils/orderStatus";

interface OrderCardProps {
  order: Order;
  busy: boolean;
  onPay: (idOrder: number) => void;
  onCancel: (idOrder: number) => void;
}

// Una compra en "Mis compras": estado, productos, total y, si está pendiente, pagar o cancelar
function OrderCard({ order, busy, onPay, onCancel }: OrderCardProps) {
  return (
    <div className="order-card">
      <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
        <div>
          <p className="order-card-title">Compra #{order.idOrder}</p>
          <p className="order-card-date">{formatOrderDate(order.orderDate)}</p>
        </div>
        <span className={`order-status order-status-${order.status.toLowerCase()}`}>
          {getStatusLabel(order.status)}
        </span>
      </div>

      <ul className="checkout-summary">
        {order.items.map((item) => (
          <li key={item.idOrderItem}>
            <span>
              {item.quantity} × {item.productName}
            </span>
            <span>${item.subtotal.toFixed(2)}</span>
          </li>
        ))}
      </ul>

      <div className="d-flex justify-content-between align-items-center">
        <span className="cart-summary-label">Total</span>
        <span className="fw-bold">${order.total.toFixed(2)}</span>
      </div>

      {order.status === "PENDING" && (
        <div className="d-flex gap-2 mt-3">
          <button
            type="button"
            className="order-action-btn flex-fill"
            onClick={() => onCancel(order.idOrder)}
            disabled={busy}
            aria-label={`Cancelar compra ${order.idOrder}`}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-red-gradient flex-fill"
            onClick={() => onPay(order.idOrder)}
            disabled={busy}
            aria-label={`Pagar compra ${order.idOrder}`}
          >
            {busy ? "Procesando..." : "Pagar ahora"}
          </button>
        </div>
      )}
    </div>
  );
}

export default OrderCard;
