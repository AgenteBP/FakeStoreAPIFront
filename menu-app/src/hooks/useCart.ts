import { useState } from "react";
import type { Product } from "../types/Product";
import type { CartItem } from "../types/CartItem";

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Devuelve false si no se pudo agregar porque ya está todo el stock en el carrito
  const addToCart = (product: Product): boolean => {
    const quantityInCart = cart.find((item) => item.product.id === product.id)?.quantity ?? 0;
    if (quantityInCart >= product.stock) {
      return false;
    }

    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item.product.id === product.id);
      if (existingProduct) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
    return true;
  };

  const deleteProduct = (productID: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productID));
  };

  const incrementProduct = (productID: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productID
          ? { ...item, quantity: Math.min(item.quantity + 1, item.product.stock) }
          : item
      )
    );
  };

  const ressProduct = (productID: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.product.id === productID
            ? { ...item, quantity: Math.max(0, item.quantity - 1) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const totalPrice = cart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  return {
    cart,
    addToCart,
    deleteProduct,
    incrementProduct,
    ressProduct,
    clearCart,
    totalItems,
    totalPrice,
  };
}
