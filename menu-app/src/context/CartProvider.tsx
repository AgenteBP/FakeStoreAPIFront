import type { ReactNode } from "react";
import { useCart } from "../hooks/useCart";
import { CartContext } from "./CartContext";

interface CartProviderProps {
  children: ReactNode;
}

// La lógica del carrito sigue en useCart: el Provider solo la comparte con toda la app
function CartProvider({ children }: CartProviderProps) {
  const cart = useCart();
  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
}

export default CartProvider;
