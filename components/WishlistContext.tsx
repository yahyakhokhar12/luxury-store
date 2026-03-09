"use client";
import { createContext, useContext, useEffect, useState } from "react";

export type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  images?: string[];
  category?: string;
};

type WishlistContextType = {
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem("luxora-wishlist");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Product[];
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWishlist(parsed);
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
