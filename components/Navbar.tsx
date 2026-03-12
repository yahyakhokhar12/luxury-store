"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/components/WishlistContext";

export default function Navbar() {
  const router = useRouter();
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();
  const { user, logout, loading } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="navbar">
      <Link className="logo" href="/">م ممتاز</Link>

      <nav className="nav-links">
        <Link className="icon-link" href="/" aria-label="Home">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3.5 10.5 12 3l8.5 7.5" />
            <path d="M6.5 9.8V20h11V9.8" />
          </svg>
        </Link>
        <Link className="icon-link" href="/products" aria-label="Products">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M10.3 4.8C10.8 3.8 11.4 3 12 3s1.2.8 1.7 1.8l1.2 2.2 2.4 1.2c.6.3.9 1 .8 1.7L17.3 21H6.7L5.9 9.9c-.1-.7.2-1.4.8-1.7L9.1 7l1.2-2.2Z" />
            <path d="M9.5 9.5h5" />
            <path d="M12 9.5V21" />
          </svg>
        </Link>
        <Link className="icon-link" href="/wishlist" aria-label="Wishlist">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 20.3 4.7 13a4.9 4.9 0 0 1 6.9-6.9L12 6.5l.4-.4A4.9 4.9 0 1 1 19.3 13L12 20.3Z" />
          </svg>
          {wishlist.length > 0 ? <span className="icon-badge">{wishlist.length}</span> : null}
        </Link>
        <Link className="icon-link" href="/cart" aria-label="Cart">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 20a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm9 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM5.2 4l1.2 8.4a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4l1.7-5.5a1 1 0 0 0-1-.9H7.1L6.8 4.5A1.5 1.5 0 0 0 5.3 3H3a1 1 0 1 0 0 2h2.2Z" />
          </svg>
          {totalItems > 0 ? <span className="icon-badge">{totalItems}</span> : null}
        </Link>
      </nav>

      <div className="nav-actions">
        {!loading && !user ? (
          <Link className="icon-link" href="/auth" aria-label="Login">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c1.8-3.5 5-5 8-5s6.2 1.5 8 5" />
            </svg>
          </Link>
        ) : null}
        {!loading && user ? (
          <>
            <span className="user-pill">{user.name || user.email}</span>
            {user.isAdmin ? (
              <Link className="icon-link" href="/admin" aria-label="Admin">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1Z" />
                  <circle cx="12" cy="10.8" r="2.4" />
                  <path d="M8.5 16.6c1-1.5 2.1-2.2 3.5-2.2s2.5.7 3.5 2.2" />
                </svg>
              </Link>
            ) : null}
            <button className="icon-link" onClick={handleLogout} aria-label="Logout">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3" />
                <path d="M14 7l5 5-5 5" />
                <path d="M19 12H9" />
              </svg>
            </button>
          </>
        ) : null}
      </div>
    </header>
  );
}
