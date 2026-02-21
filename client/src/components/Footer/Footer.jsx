import { ChevronUp } from "lucide-react";
import "./Footer.css";

export default function Footer() {
  function handleBackToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  return (
    <footer className="footer">
      <div className="footer-inner content-container">
        <div className="footer-left">
          <p className="copyright">
            © {new Date().getFullYear()} JobCompass. All rights reserved.
          </p>
        </div>

        <div className="support-footer">
          <span className="support-label">Support:</span>
          <a
            href="mailto:jobcompass2025@gmail.com?subject=Question about JobCompass"
            className="support-link"
          >
            jobcompass2025@gmail.com
          </a>
        </div>

        <button
          type="button"
          onClick={handleBackToTop}
          aria-label="Back to top"
          className="back-to-top-btn"
        >
          <ChevronUp size={22} strokeWidth={2.5} />
        </button>
      </div>
    </footer>
  );
}
