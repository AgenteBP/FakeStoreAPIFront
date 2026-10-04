export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface OrderItem {
  idOrderItem: number;
  idProduct: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  idOrder: number;
  // Datos del cliente: los usa la vista del ADMIN para saber de quién es cada compra
  customerName: string;
  customerEmail: string;
  idShippingAddress: number;
  orderDate: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
}
