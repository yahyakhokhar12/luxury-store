"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthContext";

type AdminProduct = {
  _id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  images?: string[];
};

type AdminCollection = {
  _id: string;
  title: string;
  caption?: string;
  image: string;
};

type AdminOrder = {
  _id: string;
  customerName: string;
  email: string;
  phone: string;
  address?: {
    line1?: string;
    city?: string;
    province?: string;
    postalCode?: string;
  };
  total: number;
  paymentMethod: "raast" | "card" | "cod";
  paymentStatus: "pending" | "paid" | "failed" | "cod_pending";
  orderStatus: "placed" | "processing" | "shipped" | "delivered" | "cancelled";
  items: Array<{ name: string; quantity: number; price: number }>;
  createdAt: string;
};

type Stats = {
  products: number;
  users: number;
  orders: number;
  revenue: number;
};

type AnnouncementSettings = {
  items: string[];
  ctaLabel: string;
  ctaHref: string;
};

const initialProduct = { name: "", price: "", category: "", image: "", images: [] as string[] };
const initialCollection = { title: "", caption: "", image: "" };
const initialAnnouncement = {
  itemsText:
    "Light layers, bold statements\nSummer collection just dropped\nFlat shipping in major cities\nRaast and COD available",
  ctaLabel: "Shop Now",
  ctaHref: "/products",
};

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [collections, setCollections] = useState<AdminCollection[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [error, setError] = useState("");
  const [productForm, setProductForm] = useState(initialProduct);
  const [collectionForm, setCollectionForm] = useState(initialCollection);
  const [announcementForm, setAnnouncementForm] = useState(initialAnnouncement);
  const [saving, setSaving] = useState(false);
  const [savingCollection, setSavingCollection] = useState(false);
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingCollectionImage, setUploadingCollectionImage] = useState(false);

  const loadData = async () => {
    try {
      const [statsRes, productsRes, ordersRes, collectionsRes, announcementRes] = await Promise.all([
        fetch("/api/admin/stats", { cache: "no-store" }),
        fetch("/api/admin/products", { cache: "no-store" }),
        fetch("/api/admin/orders", { cache: "no-store" }),
        fetch("/api/admin/collections", { cache: "no-store" }),
        fetch("/api/admin/announcement", { cache: "no-store" }),
      ]);

      if (!statsRes.ok || !productsRes.ok || !ordersRes.ok || !collectionsRes.ok || !announcementRes.ok) {
        throw new Error("Unable to fetch admin data. Please ensure you are an admin user.");
      }

      const [statsData, productsData, ordersData, collectionsData, announcementData] = await Promise.all([
        statsRes.json(),
        productsRes.json(),
        ordersRes.json(),
        collectionsRes.json(),
        announcementRes.json() as Promise<AnnouncementSettings>,
      ]);
      setStats(statsData);
      setProducts(productsData);
      setOrders(ordersData);
      setCollections(collectionsData);
      setAnnouncementForm({
        itemsText: (announcementData.items || []).join("\n"),
        ctaLabel: announcementData.ctaLabel || "Shop Now",
        ctaHref: announcementData.ctaHref || "/products",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin dashboard");
    }
  };

  useEffect(() => {
    if (!loading && user?.isAdmin) {
      void loadData();
    }
  }, [loading, user]);

  const addProduct = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (!productForm.image) {
        throw new Error("Please attach a product image");
      }

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: productForm.name,
          price: Number(productForm.price),
          category: productForm.category,
          image: productForm.image,
          images: productForm.images,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add product");
      setProductForm(initialProduct);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add product");
    } finally {
      setSaving(false);
    }
  };

  const onImageSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingImage(true);
    setError("");
    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append("file", file);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to upload image");
        uploadedUrls.push(data.url as string);
      }

      setProductForm((prev) => ({
        ...prev,
        image: uploadedUrls[0] || prev.image,
        images: uploadedUrls,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete product");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const addCollection = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavingCollection(true);
    setError("");
    try {
      if (!collectionForm.image) {
        throw new Error("Please attach a collection image");
      }

      const res = await fetch("/api/admin/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: collectionForm.title,
          caption: collectionForm.caption,
          image: collectionForm.image,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add collection");
      setCollectionForm(initialCollection);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add collection");
    } finally {
      setSavingCollection(false);
    }
  };

  const onCollectionImageSelect = async (file: File | null) => {
    if (!file) return;
    setUploadingCollectionImage(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload image");

      setCollectionForm((prev) => ({ ...prev, image: data.url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Collection image upload failed");
    } finally {
      setUploadingCollectionImage(false);
    }
  };

  const deleteCollection = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/collections/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete collection");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Collection delete failed");
    }
  };

  const saveAnnouncement = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavingAnnouncement(true);
    setError("");
    try {
      const items = announcementForm.itemsText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      if (items.length === 0) {
        throw new Error("Please add at least one announcement line");
      }

      const res = await fetch("/api/admin/announcement", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          ctaLabel: announcementForm.ctaLabel,
          ctaHref: announcementForm.ctaHref,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update announcement bar");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save announcement settings");
    } finally {
      setSavingAnnouncement(false);
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    field: "orderStatus" | "paymentStatus",
    value: string
  ) => {
    try {
      const payload = field === "orderStatus" ? { orderStatus: value } : { paymentStatus: value };
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update order");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order update failed");
    }
  };

  if (loading) return <section className="page-shell"><p>Loading...</p></section>;
  if (!user?.isAdmin) {
    return (
      <section className="page-shell">
        <h2>Admin Access Required</h2>
        <p>Log in with an admin account to manage products and orders.</p>
      </section>
    );
  }

  return (
    <section className="page-shell admin-shell">
      <div className="section-head">
        <h2>Admin Dashboard</h2>
        <p>Manage products, monitor orders, and track store performance.</p>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      {stats ? (
        <div className="stats-grid">
          <article className="stat-card"><h4>Products</h4><p>{stats.products}</p></article>
          <article className="stat-card"><h4>Users</h4><p>{stats.users}</p></article>
          <article className="stat-card"><h4>Orders</h4><p>{stats.orders}</p></article>
          <article className="stat-card"><h4>Paid Revenue</h4><p>Rs. {stats.revenue.toLocaleString()}</p></article>
        </div>
      ) : null}

      <div className="admin-grid">
        <div className="admin-panel">
          <h3>Add Product</h3>
          <form className="checkout-form" onSubmit={addProduct}>
            <input
              placeholder="Name"
              value={productForm.name}
              onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
            <input
              placeholder="Price (PKR)"
              type="number"
              value={productForm.price}
              onChange={(e) => setProductForm((prev) => ({ ...prev, price: e.target.value }))}
              required
            />
            <input
              placeholder="Category"
              value={productForm.category}
              onChange={(e) => setProductForm((prev) => ({ ...prev, category: e.target.value }))}
              required
            />
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => onImageSelect(e.target.files)}
              required={!productForm.image}
            />
            {uploadingImage ? <p className="muted">Uploading image...</p> : null}
            {productForm.image ? <p className="muted">Image attached: {productForm.image}</p> : null}
            {productForm.images.length > 1 ? (
              <p className="muted">Total product images: {productForm.images.length}</p>
            ) : null}
            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Add Product"}
            </button>
          </form>

          <h3>Products</h3>
          <div className="admin-list">
            {products.map((product) => (
              <article key={product._id} className="admin-item">
                <div>
                  <p><strong>{product.name}</strong></p>
                  <p>{product.category} | Rs. {Number(product.price).toLocaleString()}</p>
                  <p className="muted">Images: {product.images?.length || 1}</p>
                </div>
                <div className="btn-group">
                  <button onClick={() => deleteProduct(product._id)}>Delete</button>
                </div>
              </article>
            ))}
          </div>

          <h3>Hero Slider Collections</h3>
          <form className="checkout-form" onSubmit={addCollection}>
            <input
              placeholder="Collection title"
              value={collectionForm.title}
              onChange={(e) => setCollectionForm((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
            <input
              placeholder="Collection caption (optional)"
              value={collectionForm.caption}
              onChange={(e) => setCollectionForm((prev) => ({ ...prev, caption: e.target.value }))}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onCollectionImageSelect(e.target.files?.[0] || null)}
              required={!collectionForm.image}
            />
            {uploadingCollectionImage ? <p className="muted">Uploading collection image...</p> : null}
            {collectionForm.image ? <p className="muted">Image attached: {collectionForm.image}</p> : null}
            <button className="btn-primary" type="submit" disabled={savingCollection}>
              {savingCollection ? "Saving..." : "Add Slider Collection"}
            </button>
          </form>

          <div className="admin-list">
            {collections.map((collection) => (
              <article key={collection._id} className="admin-item">
                <div>
                  <p><strong>{collection.title}</strong></p>
                  <p className="muted">{collection.caption || "New Arrival Collection"}</p>
                  <p className="muted">{collection.image}</p>
                </div>
                <button onClick={() => deleteCollection(collection._id)}>Remove</button>
              </article>
            ))}
          </div>

          <h3>Top Announcement Bar</h3>
          <form className="checkout-form" onSubmit={saveAnnouncement}>
            <textarea
              placeholder="One announcement per line"
              value={announcementForm.itemsText}
              onChange={(e) =>
                setAnnouncementForm((prev) => ({ ...prev, itemsText: e.target.value }))
              }
              rows={4}
              required
            />
            <input
              placeholder="CTA label"
              value={announcementForm.ctaLabel}
              onChange={(e) =>
                setAnnouncementForm((prev) => ({ ...prev, ctaLabel: e.target.value }))
              }
              required
            />
            <input
              placeholder="CTA link (example: /products)"
              value={announcementForm.ctaHref}
              onChange={(e) =>
                setAnnouncementForm((prev) => ({ ...prev, ctaHref: e.target.value }))
              }
              required
            />
            <button className="btn-primary" type="submit" disabled={savingAnnouncement}>
              {savingAnnouncement ? "Saving..." : "Update Announcement Bar"}
            </button>
          </form>
        </div>

        <div className="admin-panel">
          <h3>Orders</h3>
          <div className="admin-list">
            {orders.map((order) => (
              <article key={order._id} className="admin-item order-item">
                <div>
                  <p><strong>#{order._id}</strong></p>
                  <p>{order.customerName} | {order.phone} | {order.email}</p>
                  <p>
                    Address:{" "}
                    {order.address
                      ? [
                          order.address.line1,
                          order.address.city,
                          order.address.province,
                          order.address.postalCode,
                        ]
                          .filter(Boolean)
                          .join(", ")
                      : "Not provided"}
                  </p>
                  <p>Rs. {Number(order.total).toLocaleString()} | {order.paymentMethod.toUpperCase()}</p>
                  <p>{new Date(order.createdAt).toLocaleString()}</p>
                  <p>
                    Items:{" "}
                    {order.items.map((item) => `${item.name} x${item.quantity}`).join(", ")}
                  </p>
                </div>
                <div className="order-controls">
                  <select
                    value={order.orderStatus}
                    onChange={(e) => updateOrderStatus(order._id, "orderStatus", e.target.value)}
                  >
                    <option value="placed">placed</option>
                    <option value="processing">processing</option>
                    <option value="shipped">shipped</option>
                    <option value="delivered">delivered</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                  <select
                    value={order.paymentStatus}
                    onChange={(e) => updateOrderStatus(order._id, "paymentStatus", e.target.value)}
                  >
                    <option value="pending">pending</option>
                    <option value="paid">paid</option>
                    <option value="failed">failed</option>
                    <option value="cod_pending">cod_pending</option>
                  </select>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
