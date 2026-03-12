"use client";
import { createContext, useContext, useEffect, useState } from "react";

export type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  images?: string[];
  category?: string;
  description?: string;
  inStock?: boolean;
};

type WishlistContextType = {
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>([]);

  const isValidProduct = (item: unknown): item is Product => {
    if (!item || typeof item !== "object") return false;
    const candidate = item as Product;
    return (
      typeof candidate.id === "number" &&
      typeof candidate.name === "string" &&
      typeof candidate.price === "number" &&
      typeof candidate.image === "string"
    );
  };

  useEffect(() => {
    const raw = localStorage.getItem("luxora-wishlist");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as unknown[];
      const cleaned = Array.isArray(parsed) ? parsed.filter(isValidProduct) : [];
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWishlist(cleaned);
    } catch {
      // ignore invalid storage data
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("luxora-wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) =>
      prev.find(p => p.id === product.id)
        ? prev.filter(p => p.id !== product.id)
        : [...prev, product]
    );
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
}
