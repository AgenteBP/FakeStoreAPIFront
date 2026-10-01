import { useState } from "react";
import type { Product } from "../types/Product";
import type { CartItem } from "../types/CartItem";

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item.product.id === product.id);
      if (existingProduct) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const deleteProduct = (productID: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productID));
  };

  const incrementProduct = (productID: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productID
          ? { ...item, quantity: item.quantity + 1 }
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
    totalItems,
    totalPrice,
  };
}
