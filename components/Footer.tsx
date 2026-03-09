import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-topline">
          <p>Free delivery in major cities</p>
          <p>Secure payments in PKR</p>
          <p>Lawn, Silk & Embroidery</p>
        </div>

        <div className="footer-grid">
          <section>
            <h3>م ممتاز</h3>
            <p>Pakistani ladies fashion store for lawn, silk and embroidered eastern wear.</p>
            <div className="footer-badges">
              <span>Women Fashion</span>
              <span>Raast + COD Pakistan</span>
            </div>
          </section>

          <section>
            <h4>Explore</h4>
            <div className="footer-links">
              <Link href="/">Home</Link>
              <Link href="/products">Products</Link>
              <Link href="/wishlist">Wishlist</Link>
              <Link href="/cart">Cart</Link>
            </div>
          </section>

          <section>
            <h4>Account</h4>
            <div className="footer-links">
              <Link href="/auth">Sign In</Link>
              <Link href="/admin">Admin</Link>
            </div>
          </section>

          <section>
            <h4>Contact</h4>
            <p>support@luxora.store</p>
            <p>+92 300 0000000</p>
            <p>Pakistan</p>
          </section>
        </div>

        <div className="footer-bottom">
          <p>Copyright {new Date().getFullYear()} م ممتاز. All rights reserved.</p>
          <p>Designed for Pakistani eastern wear shopping.</p>
        </div>
      </div>
    </footer>
  );
}
