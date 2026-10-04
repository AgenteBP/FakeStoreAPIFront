import type { AdminUser, StockItem } from "../types/Admin";
import type { AuthUser } from "../types/AuthUser";
import type { Order, OrderStatus } from "../types/Order";
import { apiRequest } from "./api";

// Todas estas llamadas son solo para ADMIN: el backend responde 403 a cualquier otro rol

// ---- Usuarios ----

export function getUsers(admin: AuthUser): Promise<AdminUser[]> {
  return apiRequest<AdminUser[]>("/api/users", { token: admin.token });
}

// Baja lógica: el backend también cancela sus compras PENDING y PAID
export function deactivateUser(
  admin: AuthUser,
  idUser: number
): Promise<{ user: AdminUser; cancelledOrders: number }> {
  return apiRequest(`/api/users/${idUser}/deactivate`, { method: "PATCH", token: admin.token });
}

export function activateUser(admin: AuthUser, idUser: number): Promise<AdminUser> {
  return apiRequest<AdminUser>(`/api/users/${idUser}/activate`, { method: "PATCH", token: admin.token });
}

// ---- Compras ----

export function getAllOrders(admin: AuthUser): Promise<Order[]> {
  return apiRequest<Order[]>("/api/orders", { token: admin.token });
}

export function changeOrderStatus(admin: AuthUser, idOrder: number, status: OrderStatus): Promise<Order> {
  return apiRequest<Order>(`/api/orders/${idOrder}/status`, {
    method: "PATCH",
    token: admin.token,
    body: { status },
  });
}

// ---- Stock ----

export function getStock(admin: AuthUser): Promise<StockItem[]> {
  return apiRequest<StockItem[]>("/api/inventory", { token: admin.token });
}

// Suma unidades a lo disponible de un producto
export function restockProduct(admin: AuthUser, idProduct: number, quantity: number): Promise<unknown> {
  return apiRequest(`/api/products/${idProduct}/inventory/restock`, {
    method: "POST",
    token: admin.token,
    body: { quantity },
  });
}
