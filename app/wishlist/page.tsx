"use client";

import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/components/WishlistContext";

export default function WishlistPage() {
  const { wishlist } = useWishlist();

  return (
    <section className="page-shell">
      <div className="section-head">
        <h2>Your Wishlist</h2>
        <p>Items saved for your next purchase.</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="empty-state">
          <h3>No items saved yet</h3>
          <p>Tap Wishlist on any product and it will appear here.</p>
        </div>
      ) : (
        <div className="grid">
          {wishlist.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
