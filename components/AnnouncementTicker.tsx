"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const fallbackItems = [
  "Light layers, bold statements",
  "Summer collection just dropped",
  "Flat shipping in major cities",
  "Raast and COD available",
];

type AnnouncementData = {
  items: string[];
  ctaLabel: string;
  ctaHref: string;
};

export default function AnnouncementTicker() {
  const [data, setData] = useState<AnnouncementData>({
    items: fallbackItems,
    ctaLabel: "Shop Now",
    ctaHref: "/products",
  });

  useEffect(() => {
    const loadAnnouncement = async () => {
      try {
        const res = await fetch("/api/announcement", { cache: "no-store" });
        if (!res.ok) return;
        const payload = (await res.json()) as Partial<AnnouncementData>;
        const items = Array.isArray(payload.items)
          ? payload.items.filter(
              (item): item is string => typeof item === "string" && item.trim().length > 0
            )
          : fallbackItems;

        setData({
          items: items.length > 0 ? items : fallbackItems,
          ctaLabel: payload.ctaLabel?.trim() || "Shop Now",
          ctaHref: payload.ctaHref?.trim() || "/products",
        });
      } catch {
        setData({ items: fallbackItems, ctaLabel: "Shop Now", ctaHref: "/products" });
      }
    };

    void loadAnnouncement();
  }, []);

  const message = useMemo(
    () =>
      data.items.map((item, index) => (
        <span key={`${item}-${index}`}>
          {item}
          {index === data.items.length - 1 ? "" : " | "}
        </span>
      )),
    [data.items]
  );

  return (
    <section className="announcement" aria-label="Store announcements">
      <div className="announcement-track">
        <p>
          {message}{" "}
          <Link href={data.ctaHref}>{data.ctaLabel}</Link>
        </p>
        <p aria-hidden="true">
          {message}{" "}
          <Link href={data.ctaHref}>{data.ctaLabel}</Link>
        </p>
      </div>
    </section>
  );
}
