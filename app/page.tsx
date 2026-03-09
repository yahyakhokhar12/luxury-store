import Link from "next/link";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <>
      <Hero />
      <section className="feature-strip">
        <article>
          <h3>Seasonal Lawn Edits</h3>
          <p>Fresh Pakistani lawn prints and stitched looks for everyday wear.</p>
        </article>
        <article>
          <h3>Raast + COD in Pakistan</h3>
          <p>Pay via Raast transfer in PKR or choose cash on delivery at checkout.</p>
        </article>
        <article>
          <h3>Silk & Embroidery Picks</h3>
          <p>Festive formals, embroidered collections and premium fabrics.</p>
        </article>
      </section>
      <section className="cta-block">
        <h2>Ready to shop your next lawn and festive look?</h2>
        <Link className="btn-primary" href="/products">
          Explore Collections
        </Link>
      </section>
    </>
  );
}
