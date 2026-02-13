import "./Footer.css";
import { Link } from "react-router-dom";

export default function Footer() {
  function handleBackToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  return (
    <footer className="footer">
      <div className="footer-inner content-container">
        <div className="logo">
          <Link to="/" className="logo-link">
            <span className="logo-text-footer">Job Compass</span>
          </Link>
        </div>

        <div className="copyright">
          <p>© {new Date().getFullYear()} Job Compass</p>
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

        {/* back to top button */}
        <button
          type="button"
          onClick={handleBackToTop}
          aria-label="Back to top"
          className="back-btn-footer"
        >
          Back to top
        </button>
      </div>
    </footer>
  );
}
