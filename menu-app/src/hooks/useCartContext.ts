import { useContext } from "react";
import { CartContext, type CartContextValue } from "../context/CartContext";

export function useCartContext(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext se tiene que usar dentro de <CartProvider>");
  }
  return context;
}
