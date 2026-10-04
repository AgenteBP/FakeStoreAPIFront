import type { OrderStatus } from "../types/Order";

// Texto que ve el usuario para cada estado de la compra
export function getStatusLabel(status: OrderStatus): string {
  switch (status) {
    case "PENDING":
      return "Pendiente de pago";
    case "PAID":
      return "Pagada";
    case "SHIPPED":
      return "Enviada";
    case "DELIVERED":
      return "Entregada";
    case "CANCELLED":
      return "Cancelada";
  }
}

// Siguiente paso del flujo PENDING -> PAID -> SHIPPED -> DELIVERED.
// null si la compra ya terminó (entregada o cancelada).
export function getNextStatus(status: OrderStatus): OrderStatus | null {
  switch (status) {
    case "PENDING":
      return "PAID";
    case "PAID":
      return "SHIPPED";
    case "SHIPPED":
      return "DELIVERED";
    case "DELIVERED":
    case "CANCELLED":
      return null;
  }
}

// El ADMIN puede cancelar mientras la compra no salió (el backend devuelve el stock)
export function canAdminCancel(status: OrderStatus): boolean {
  return status === "PENDING" || status === "PAID";
}

// Las fechas llegan del backend como "2026-10-03T17:24:45.123" (hora local del servidor)
export function formatOrderDate(orderDate: string): string {
  return new Date(orderDate).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });
}
