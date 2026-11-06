import { createContext } from "react";
import type { useCart } from "../hooks/useCart";

// Lo que se comparte es exactamente lo que devuelve useCart (carrito, acciones y totales)
export type CartContextValue = ReturnType<typeof useCart>;

// Vale null fuera de <CartProvider>: useCartContext lo detecta y avisa con un error
export const CartContext = createContext<CartContextValue | null>(null);
