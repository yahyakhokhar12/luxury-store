"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import { useCart } from "./CartContext";
import { useWishlist, type Product } from "./WishlistContext";

type PaymentMethod = "raast" | "cod";

type CustomerForm = {
  name: string;
  email: string;
  phone: string;
  address: {
    line1: string;
    city: string;
    province: string;
    postalCode: string;
  };
};

const emptyCustomer: CustomerForm = {
  name: "",
  email: "",
  phone: "",
  address: { line1: "", city: "", province: "", postalCode: "" },
};

const SWIPE_THRESHOLD = 35;

export default function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();
  const isLiked = wishlist.some((item) => item.id === product.id);

  const [showBuyModal, setShowBuyModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("raast");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [customer, setCustomer] = useState<CustomerForm>(emptyCustomer);
  const [activeImage, setActiveImage] = useState(0);
  const pointerStartX = useRef<number | null>(null);
  const productImages = useMemo(() => {
    const fromProduct = Array.isArray(product.images)
      ? product.images.filter((img) => typeof img === "string" && img.trim().length > 0)
      : [];
    return fromProduct.length > 0 ? fromProduct : [product.image];
  }, [product.image, product.images]);
  const hasMultiImages = productImages.length > 1;

  useEffect(() => {
    if (!user) return;
    setCustomer({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: {
        line1: user.address?.line1 || "",
        city: user.address?.city || "",
        province: user.address?.province || "",
        postalCode: user.address?.postalCode || "",
      },
    });
  }, [user]);

  useEffect(() => {
    setActiveImage(0);
  }, [product.id, productImages.length]);

  const showNextImage = () => {
    if (!hasMultiImages) return;
    setActiveImage((prev) => (prev + 1) % productImages.length);
  };

  const showPrevImage = () => {
    if (!hasMultiImages) return;
    setActiveImage((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerStartX.current = e.clientX;
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!hasMultiImages || pointerStartX.current === null) return;
    const deltaX = e.clientX - pointerStartX.current;
    if (deltaX <= -SWIPE_THRESHOLD) showNextImage();
    if (deltaX >= SWIPE_THRESHOLD) showPrevImage();
    pointerStartX.current = null;
  };

  const validateCustomer = () => {
    if (!customer.name || !customer.email || !customer.phone) return false;
    if (
      !customer.address.line1 ||
      !customer.address.city ||
      !customer.address.province ||
      !customer.address.postalCode
    ) {
      return false;
    }
    return true;
  };

  const buyNow = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    if (!validateCustomer()) {
      setError("Please complete your address and contact details.");
      setLoading(false);
      return;
    }

    const payload = {
      items: [{ ...product, quantity: 1 }],
      customer,
      deliveryFee: 350,
    };

    try {
      if (paymentMethod === "raast") {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Raast checkout failed");
        setMessage(
          `Raast order placed. Ref: ${data.raastReference}. Send payment to ${
            data.raast?.iban || data.raast?.mobile || "the provided Raast account"
          } and keep your transaction ID.`
        );
        return;
      }

      const codRes = await fetch("/api/orders/cod", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const codData = await codRes.json();
      if (!codRes.ok) throw new Error(codData.error || "COD order failed");
      setMessage(`COD order placed. Order #${codData.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.article className="card product-card" whileHover={{ y: -6, scale: 1.01 }}>
        <div className="product-media" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
          <Image src={productImages[activeImage]} alt={product.name} width={400} height={280} />
          {hasMultiImages ? (
            <>
              <button
                type="button"
                className="media-nav media-prev"
                onClick={showPrevImage}
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                type="button"
                className="media-nav media-next"
                onClick={showNextImage}
                aria-label="Next image"
              >
                ›
              </button>
              <div className="media-dots">
                {productImages.map((_, index) => (
                  <button
                    key={`${product.id}-dot-${index}`}
                    type="button"
                    className={`media-dot ${index === activeImage ? "is-active" : ""}`}
                    onClick={() => setActiveImage(index)}
                    aria-label={`Show image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
        <p className="product-category">{product.category || "Ready To Wear"}</p>
        <h3>{product.name}</h3>
        <p className="price">Rs. {product.price.toLocaleString()}</p>

        <div className="btn-group">
          <button className="btn-primary icon-text-btn" onClick={() => addToCart(product)}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 20a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm9 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM5.2 4l1.2 8.4a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4l1.7-5.5a1 1 0 0 0-1-.9H7.1L6.8 4.5A1.5 1.5 0 0 0 5.3 3H3a1 1 0 1 0 0 2h2.2Z" />
            </svg>
            Add to Cart
          </button>
          <button onClick={() => setShowBuyModal(true)}>Buy Now</button>
          <button className="icon-text-btn" onClick={() => toggleWishlist(product)}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 20.3 4.7 13a4.9 4.9 0 0 1 6.9-6.9L12 6.5l.4-.4A4.9 4.9 0 1 1 19.3 13L12 20.3Z" />
            </svg>
            {isLiked ? "Saved" : "Wishlist"}
          </button>
        </div>
      </motion.article>

      {showBuyModal ? (
        <div className="modal-backdrop" onClick={() => setShowBuyModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Buy {product.name}</h3>
              <button onClick={() => setShowBuyModal(false)}>Close</button>
            </div>

            <div className="checkout-form">
              <input
                value={customer.name}
                onChange={(e) => setCustomer((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Full Name"
              />
              <input
                value={customer.email}
                onChange={(e) => setCustomer((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Email"
              />
              <input
                value={customer.phone}
                onChange={(e) => setCustomer((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="Phone"
              />
              <input
                value={customer.address.line1}
                onChange={(e) =>
                  setCustomer((prev) => ({
                    ...prev,
                    address: { ...prev.address, line1: e.target.value },
                  }))
                }
                placeholder="Address"
              />
              <div className="auth-grid">
                <input
                  value={customer.address.city}
                  onChange={(e) =>
                    setCustomer((prev) => ({
                      ...prev,
                      address: { ...prev.address, city: e.target.value },
                    }))
                  }
                  placeholder="City"
                />
                <input
                  value={customer.address.province}
                  onChange={(e) =>
                    setCustomer((prev) => ({
                      ...prev,
                      address: { ...prev.address, province: e.target.value },
                    }))
                  }
                  placeholder="Province"
                />
                <input
                  value={customer.address.postalCode}
                  onChange={(e) =>
                    setCustomer((prev) => ({
                      ...prev,
                      address: { ...prev.address, postalCode: e.target.value },
                    }))
                  }
                  placeholder="Postal Code"
                />
              </div>

              <div className="payment-method">
                <label>
                  <input
                    type="radio"
                    checked={paymentMethod === "raast"}
                    onChange={() => setPaymentMethod("raast")}
                  />
                  Raast Transfer (PKR)
                </label>
                <label>
                  <input
                    type="radio"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                  />
                  Cash on Delivery
                </label>
              </div>

              <p className="summary-row total">
                <span>Total</span>
                <span>Rs. {(product.price + 350).toLocaleString()}</span>
              </p>
              {error ? <p className="form-error">{error}</p> : null}
              {message ? <p className="form-success">{message}</p> : null}
              <button className="btn-primary" onClick={buyNow} disabled={loading}>
                {loading ? "Processing..." : "Confirm Order"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
