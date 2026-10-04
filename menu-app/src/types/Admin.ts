// Usuario tal como lo lista el backend para el ADMIN (GET /api/users)
export interface AdminUser {
  idUser: number;
  userName: string;
  email: string;
  role: "ADMIN" | "CLIENT";
  registrationDate: string | null;
  active: boolean;
}

// Stock de un producto (GET /api/inventory)
export interface StockItem {
  idProduct: number;
  productName: string;
  sku: string;
  active: boolean;
  availableQuantity: number;
  reservedQuantity: number;
}
