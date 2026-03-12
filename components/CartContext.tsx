"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "./WishlistContext";

export type CartItem = Product & {
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (product: Product) => void;
  removeFromCart: (id: number) => void;
  increaseQty: (id: number) => void;
  decreaseQty: (id: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const isValidCartItem = (item: unknown): item is CartItem => {
    if (!item || typeof item !== "object") return false;
    const candidate = item as CartItem;
    return (
      typeof candidate.id === "number" &&
      typeof candidate.name === "string" &&
      typeof candidate.price === "number" &&
      typeof candidate.image === "string" &&
      typeof candidate.quantity === "number"
    );
  };

  useEffect(() => {
    const raw = localStorage.getItem("luxora-cart");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as unknown[];
      const cleaned = Array.isArray(parsed) ? parsed.filter(isValidCartItem) : [];
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCart(cleaned);
    } catch {
      // ignore invalid storage data
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("luxora-cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const increaseQty = (id: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQty = (id: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const totalPrice = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        totalItems,
        totalPrice,
        addToCart,
        removeFromCart,
        increaseQty,
        decreaseQty,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
