"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthContext";

type MyOrder = {
  _id: string;
  total: number;
  paymentMethod: "raast" | "cod" | "card";
  paymentStatus: "pending" | "paid" | "failed" | "cod_pending";
  orderStatus: "placed" | "processing" | "shipped" | "delivered" | "cancelled";
  raastReference?: string;
  createdAt: string;
  items: Array<{ name: string; quantity: number; price: number }>;
};

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await fetch("/api/orders/my", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load orders");
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load orders");
      }
    };

    if (user) {
      void loadOrders();
    }
  }, [user]);

  if (loading) {
    return (
      <section className="page-shell">
        <p>Loading...</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="page-shell">
        <h2>Track Orders</h2>
        <p>Please sign in to view your order status.</p>
      </section>
    );
  }

  return (
    <section className="page-shell">
      <div className="section-head">
        <h2>Track Orders</h2>
        <p>See latest status for your placed orders.</p>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      {orders.length === 0 ? (
        <div className="empty-state">
          <h3>No orders yet</h3>
          <p>Your placed orders will appear here with current status.</p>
        </div>
      ) : (
        <div className="admin-list">
          {orders.map((order) => (
            <article key={order._id} className="admin-item order-item">
              <div>
                <p><strong>Order #{order._id}</strong></p>
                <p>{new Date(order.createdAt).toLocaleString()}</p>
                <p>
                  Payment: {order.paymentMethod.toUpperCase()} | {order.paymentStatus}
                </p>
                {order.raastReference ? <p>Raast Ref: {order.raastReference}</p> : null}
                <p>Order Status: <strong>{order.orderStatus}</strong></p>
                <p>
                  Items: {order.items.map((item) => `${item.name} x${item.quantity}`).join(", ")}
                </p>
                <p>Total: Rs. {Number(order.total).toLocaleString()}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
