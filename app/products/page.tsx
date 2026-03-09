"use client";

import { useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { products as localProducts } from "@/data/products";
import type { Product } from "@/components/WishlistContext";

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  Mahay: "https://plus.unsplash.com/premium_photo-1673757106128-eaab1a42ca49?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cGFraXN0YW5pJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
  Muzlin: "https://images.unsplash.com/photo-1733209590486-4ed0bfcbc52a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8cGFraXN0YW5pJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
  "Nura Festive": "https://images.unsplash.com/photo-1733209588000-339b73c36575?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHBha2lzdGFuaSUyMGZhc2hpb258ZW58MHx8MHx8fDA%3D",
  "Luxury Lawn": "https://images.unsplash.com/photo-1733209589780-ece842d0dcf8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHBha2lzdGFuaSUyMGZhc2hpb258ZW58MHx8MHx8fDA%3D",
  "Ready To Wear": "https://images.unsplash.com/photo-1733209587923-77ff33202f7c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHBha2lzdGFuaSUyMGZhc2hpb258ZW58MHx8MHx8fDA%3D",
  "Luxury Pret": "https://images.unsplash.com/photo-1733209589578-97136bee7d7a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHBha2lzdGFuaSUyMGZhc2hpb258ZW58MHx8MHx8fDA%3D",
  Signature: "https://images.unsplash.com/photo-1733209589780-99d3a8a3b3e4?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHBha2lzdGFuaSUyMGZhc2hpb258ZW58MHx8MHx8fDA%3D",
  Basics: "https://images.unsplash.com/photo-1733209587957-7fd1ccbdfa87?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHBha2lzdGFuaSUyMGZhc2hpb258ZW58MHx8MHx8fDA%3D",
  Essentials: "https://images.unsplash.com/photo-1733209484732-6b094322a89f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fHBha2lzdGFuaSUyMGZhc2hpb258ZW58MHx8MHx8fDA%3D",
  "Silk Tunics": "https://images.unsplash.com/photo-1733209590486-4ed0bfcbc52a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8cGFraXN0YW5pJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
};

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [products, setProducts] = useState<Product[]>(localProducts);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as Array<
          Product & { _id?: string; id?: number; images?: string[] }
        >;
        const normalized = data.map((item, index) => {
          const itemCategory = item.category || "Ready To Wear";
          const mappedImage = CATEGORY_IMAGE_MAP[itemCategory];
          const normalizedImages = Array.isArray(item.images)
            ? item.images.filter((img) => typeof img === "string" && img.trim().length > 0)
            : [];
          const primaryImage = item.image || normalizedImages[0] || mappedImage;
          return {
            id: item.id ?? index + 1,
            name: item.name,
            price: Number(item.price),
            category: itemCategory,
            image: primaryImage,
            images: normalizedImages.length > 0 ? normalizedImages : [primaryImage],
          };
        });
        if (normalized.length > 0) setProducts(normalized);
      } catch {
        setProducts(localProducts);
      }
    };
    void loadProducts();
  }, []);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.category || "Ready To Wear")))],
    [products]
  );

  const filtered = products.filter(
    (p) =>
      (category === "All" || (p.category || "Ready To Wear") === category) &&
      p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="page-shell">
      <div className="section-head">
        <h2>Women Eastern Wear Collection</h2>
        <p>Shop Pakistani lawn, silk, pret and embroidered styles in PKR.</p>
      </div>

      <div className="filters">
        <input
          value={search}
          placeholder="Search products..."
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="grid">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
