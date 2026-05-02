import { Link } from "react-router-dom";
import { Mail, ShieldCheck } from "lucide-react";
import "./Footer.css";

const mailSupport =
  "mailto:jobcompass2025@gmail.com?subject=Question about JobCompass";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner content-container">
        <div className="footer-brand">
          <p className="footer-brand-title">Job Compass</p>
          <p className="copyright">
            © {new Date().getFullYear()} Job Compass. All rights reserved.
          </p>
        </div>

        <nav className="footer-nav" aria-label="Footer">
          <Link className="footer-nav-link" to="/privacy">
            <ShieldCheck
              className="footer-nav-icon"
              size={16}
              strokeWidth={2}
              aria-hidden
            />
            Privacy
          </Link>
          <span className="footer-nav-divider" aria-hidden="true">
            ·
          </span>
          <Link className="footer-nav-link" to="/about#contact">
            <Mail
              className="footer-nav-icon"
              size={16}
              strokeWidth={2}
              aria-hidden
            />
            Contact
          </Link>
        </nav>

        <div className="footer-support">
          <span className="support-label">Support</span>
          <a href={mailSupport} className="support-link">
            jobcompass2025@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
