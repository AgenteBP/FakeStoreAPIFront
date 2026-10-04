import type { AuthUser } from "../types/AuthUser";
import type { CartItem } from "../types/CartItem";
import type { Order } from "../types/Order";
import { apiRequest } from "./api";

// Crea la compra con lo que hay en el carrito. Solo se mandan ids y cantidades:
// el precio lo pone el backend, así nadie puede cambiarlo desde el navegador.
export function createOrder(user: AuthUser, idShippingAddress: number, cart: CartItem[]): Promise<Order> {
  return apiRequest<Order>("/api/orders", {
    method: "POST",
    token: user.token,
    body: {
      idShippingAddress,
      items: cart.map((item) => ({ idProduct: item.product.id, quantity: item.quantity })),
    },
  });
}

// Compras del usuario logueado, de la más nueva a la más vieja
export function getMyOrders(user: AuthUser): Promise<Order[]> {
  return apiRequest<Order[]>(`/api/users/${user.idUser}/orders`, { token: user.token });
}

// Pago simulado: pasa la compra de PENDING a PAID
export function payOrder(user: AuthUser, idOrder: number): Promise<Order> {
  return apiRequest<Order>(`/api/orders/${idOrder}/pay`, { method: "POST", token: user.token });
}

// Cancela una compra PENDING; el backend devuelve el stock reservado
export function cancelOrder(user: AuthUser, idOrder: number): Promise<Order> {
  return apiRequest<Order>(`/api/orders/${idOrder}/cancel`, { method: "POST", token: user.token });
}
