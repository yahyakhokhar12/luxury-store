"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthContext";
import { useCart, type CartItem } from "@/components/CartContext";

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

type PaymentMethod = "raast" | "cod";
type CheckoutTarget = { type: "item"; item: CartItem } | { type: "cart" } | null;
type MyOrder = {
  _id: string;
  orderStatus: "placed" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "cod_pending";
  createdAt: string;
};

export default function CartPage() {
  const { user } = useAuth();
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("raast");
  const [target, setTarget] = useState<CheckoutTarget>(null);
  const {
    cart,
    totalItems,
    totalPrice,
    removeFromCart,
    increaseQty,
    decreaseQty,
    clearCart,
  } = useCart();
  const [loading, setLoading] = useState(false);
  const [codLoading, setCodLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [customer, setCustomer] = useState<CustomerForm>({
    name: "",
    email: "",
    phone: "",
    address: { line1: "", city: "", province: "", postalCode: "" },
  });

  const targetItems = useMemo(() => {
    if (!target) return [];
    return target.type === "item" ? [{ ...target.item, quantity: 1 }] : cart;
  }, [target, cart]);

  const subtotal = useMemo(
    () => targetItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [targetItems]
  );
  const deliveryFee = useMemo(() => (targetItems.length ? 350 : 0), [targetItems.length]);
  const grandTotal = subtotal + deliveryFee;

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
    const loadMyOrders = async () => {
      try {
        const res = await fetch("/api/orders/my", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as MyOrder[];
        setOrders(data.slice(0, 5));
      } catch {
        // ignore order load failures in cart view
      }
    };

    if (user) {
      void loadMyOrders();
    } else {
      setOrders([]);
    }
  }, [user, message]);

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

  const checkoutWithRaast = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    if (!validateCustomer()) {
      setError("Please complete name, contact, and full delivery address.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: targetItems, customer, deliveryFee }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Raast checkout failed");
      }
      if (target?.type === "item") {
        removeFromCart(target.item.id);
      } else {
        clearCart();
      }
      setMessage(
        `Raast order placed successfully. Order #${data.orderId}. Ref: ${data.raastReference}.`
      );
      setShowBuyModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create Raast order");
    } finally {
      setLoading(false);
    }
  };

  const checkoutWithCOD = async () => {
    setCodLoading(true);
    setError("");
    setMessage("");

    if (!validateCustomer()) {
      setError("Please complete name, contact, and full delivery address.");
      setCodLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/orders/cod", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: targetItems, customer, deliveryFee }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "COD order failed");
      }
      if (target?.type === "item") {
        removeFromCart(target.item.id);
      } else {
        clearCart();
      }
      setMessage(`COD order placed successfully. Order #${data.orderId}`);
      setShowBuyModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to place COD order");
    } finally {
      setCodLoading(false);
    }
  };

  const openBuyModal = (nextTarget: CheckoutTarget) => {
    setTarget(nextTarget);
    setPaymentMethod("raast");
    setError("");
    setMessage("");
    if (!validateCustomer()) {
      setError("Please complete name, contact, and full delivery address.");
    }
    setShowBuyModal(true);
  };

  const confirmBuy = async () => {
    if (paymentMethod === "raast") {
      await checkoutWithRaast();
      return;
    }
    await checkoutWithCOD();
  };

  return (
    <section className="page-shell">
      <div className="section-head">
        <h2>Your Cart</h2>
        <p>{totalItems} items selected</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <Link className="btn-primary" href="/orders">
          Track Orders
        </Link>
      </div>

      {error ? <p className="form-error">{error}</p> : null}
      {message ? <p className="form-success">{message}</p> : null}

      {orders.length > 0 ? (
        <div className="checkout-box" style={{ marginBottom: 12 }}>
          <h3 style={{ margin: "0 0 8px" }}>Recent Order Status</h3>
          {orders.map((order) => (
            <p key={order._id} className="muted" style={{ margin: "6px 0" }}>
              Order #{order._id} | Status: {order.orderStatus} | Payment: {order.paymentStatus}
            </p>
          ))}
        </div>
      ) : null}

      {cart.length === 0 ? (
        <div className="empty-state">
          <h3>Your cart is empty</h3>
          <p>Add products from the products page to start checkout.</p>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button className="btn-primary" onClick={() => openBuyModal({ type: "cart" })}>
              Buy All
            </button>
            <button onClick={clearCart}>Clear Cart</button>
          </div>

          <div className="cart-list">
            {cart.map((item) => (
              <article key={item.id} className="cart-item">
                <Image src={item.image} alt={item.name} width={140} height={100} />
                <div className="cart-meta">
                  <h3>{item.name}</h3>
                  <p>Rs. {item.price.toLocaleString()}</p>
                  <div className="qty-group">
                    <button onClick={() => decreaseQty(item.id)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => increaseQty(item.id)}>+</button>
                    <button onClick={() => removeFromCart(item.id)}>Remove</button>
                    <button className="btn-primary" onClick={() => openBuyModal({ type: "item", item })}>
                      Buy Now
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="summary-row total" style={{ marginTop: 14 }}>
            <span>Cart Total (without delivery)</span>
            <span>Rs. {totalPrice.toLocaleString()}</span>
          </div>
        </>
      )}

      {showBuyModal ? (
        <div className="modal-backdrop" onClick={() => setShowBuyModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>{target?.type === "item" ? "Buy Item" : "Buy Cart"}</h3>
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
                placeholder="Phone e.g. 03xx1234567"
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

            <div className="summary-row">
              <span>Subtotal</span>
              <span>Rs. {subtotal.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <span>Rs. {deliveryFee.toLocaleString()}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>Rs. {grandTotal.toLocaleString()}</span>
            </div>

            <button
              className="btn-primary"
              onClick={confirmBuy}
              disabled={loading || codLoading || targetItems.length === 0}
            >
              {loading || codLoading ? "Processing..." : "Confirm Buy"}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
