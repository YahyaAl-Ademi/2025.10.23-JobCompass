import "./Footer.css";

export default function Footer() {
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
      </div>
    </footer>
  );
}
