"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { products as localProducts } from "@/data/products";

type HeroSlide = {
  id: string;
  name: string;
  category: string;
  image: string;
};

const ROTATE_SECONDS = 6;
const SWIPE_THRESHOLD = 45;

export default function Hero() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const pointerStartX = useRef<number | null>(null);

  useEffect(() => {
    const loadSlides = async () => {
      try {
        const res = await fetch("/api/collections", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch");
        const data = (await res.json()) as Array<{
          _id?: string;
          title: string;
          caption?: string;
          image: string;
        }>;

        const normalized = data.slice(0, 6).map((item, index) => ({
          id: item._id || String(index + 1),
          name: item.title,
          category: item.caption || "New Arrival",
          image: item.image,
        }));

        if (normalized.length > 0) {
          setSlides(normalized);
          return;
        }
      } catch {
        // fallback below
      }

      const fallbackSlides = localProducts.slice(0, 6).map((item) => ({
        id: String(item.id),
        name: item.name,
        category: item.category || "New Arrival",
        image: item.image,
      }));
      setSlides(fallbackSlides);
    };

    void loadSlides();
  }, []);

  const hasSlides = slides.length > 0;
  const goNext = useCallback(() => {
    setActiveIndex((current) => (current + 1) % slides.length);
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (!hasSlides) return;
    const timer = window.setInterval(() => {
      goNext();
    }, ROTATE_SECONDS * 1000);

    return () => window.clearInterval(timer);
  }, [hasSlides, goNext, slides.length]);

  const activeSlide = useMemo(() => slides[activeIndex], [slides, activeIndex]);
  const onPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    pointerStartX.current = e.clientX;
  };

  const onPointerUp = (e: React.PointerEvent<HTMLElement>) => {
    if (pointerStartX.current === null || slides.length < 2) return;
    const deltaX = e.clientX - pointerStartX.current;
    if (deltaX <= -SWIPE_THRESHOLD) goNext();
    if (deltaX >= SWIPE_THRESHOLD) goPrev();
    pointerStartX.current = null;
  };

  return (
    <section className="hero" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
      {slides.map((slide, index) => (
        <Image
          key={slide.id}
          src={slide.image}
          alt={slide.name}
          fill
          priority={index === 0}
          className={`hero-slide ${index === activeIndex ? "is-active" : ""}`}
          style={{ objectFit: "cover" }}
        />
      ))}

      <div className="hero-overlay" />
      <div className="hero-content">
        <p className="hero-tag">New Arrival Collections</p>
        <h1>{activeSlide?.name || "Pakistani Ladies Lawn, Silk & Embroidery"}</h1>
        <p>
          {activeSlide
            ? `${activeSlide.category} edit now live.`
            : "Unstitched and ready-to-wear eastern styles with Raast and cash on delivery across Pakistan."}
        </p>
        <div className="hero-cta">
          <Link className="btn-primary" href="/products">
            Shop New Arrivals
          </Link>
          <Link href="/auth">Member Access</Link>
        </div>
        {slides.length > 1 ? (
          <div className="hero-dots" aria-label="Collection slider controls">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                className={`hero-dot ${index === activeIndex ? "is-active" : ""}`}
                onClick={() => setActiveIndex(index)}
                aria-label={`Show ${slide.name}`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
